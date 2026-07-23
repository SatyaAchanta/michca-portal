"use server";

import { revalidatePath } from "next/cache";

import {
  Division,
  GameResult,
  GameStatus,
  MichcaMadnessConfigStatus,
  MichcaMadnessEntryStatus,
} from "@/generated/prisma/client";
import { grounds } from "@/lib/data";
import {
  MICHCA_MADNESS_DIVISIONS,
  MICHCA_MADNESS_SEASON,
  areSeedsComplete,
  getDownstreamSlotKeys,
  getOpeningSlotKeys,
  getRemainingPickCount,
  requireMichcaMadnessTemplate,
  resolveBracketSlots,
  validateBracketPicks,
  validatePartialBracketPicks,
  type MichcaMadnessDivision,
} from "@/lib/michca-madness";
import { prisma } from "@/lib/prisma";
import { parseDetroitDateTime } from "@/lib/schedule-import";
import {
  AuthenticationRequiredError,
  getOrCreateCurrentUserProfile,
  requireMichcaMadnessAdminProfile,
} from "@/lib/user-profile";

export type MichcaMadnessActionState = {
  status: "idle" | "success" | "error";
  message?: string;
};

export type MichcaMadnessPickSaveResponse = {
  success: boolean;
  message?: string;
  savedPicks?: Array<{ slotKey: string; predictedWinnerCode: string }>;
  completedCount?: number;
  totalCount?: number;
  isComplete?: boolean;
};

const INITIAL_ERROR: MichcaMadnessActionState = { status: "error" };
const KNOWN_VENUES = new Set(grounds.map((ground) => ground.name));

function revalidateMichcaMadness() {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/michca-madness");
  revalidatePath("/michca-madness");
}

async function requireMichcaMadnessAdmin() {
  return requireMichcaMadnessAdminProfile();
}

function normalizeRequiredString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeOptionalString(value: FormDataEntryValue | null) {
  const normalized = normalizeRequiredString(value);
  return normalized.length > 0 ? normalized : null;
}

function normalizeDivision(value: FormDataEntryValue | null): MichcaMadnessDivision {
  const normalized = normalizeRequiredString(value);
  if (MICHCA_MADNESS_DIVISIONS.includes(normalized as MichcaMadnessDivision)) {
    return normalized as MichcaMadnessDivision;
  }
  throw new Error("Invalid MichCA-Madness division.");
}

function normalizeStatus(value: FormDataEntryValue | null) {
  const normalized = normalizeRequiredString(value);
  if (
    normalized === MichcaMadnessConfigStatus.COMING_SOON ||
    normalized === MichcaMadnessConfigStatus.READY ||
    normalized === MichcaMadnessConfigStatus.LOCKED
  ) {
    return normalized;
  }
  return MichcaMadnessConfigStatus.COMING_SOON;
}

function parseSeason(value: FormDataEntryValue | null) {
  const parsed = Number.parseInt(normalizeRequiredString(value), 10);
  return Number.isFinite(parsed) ? parsed : MICHCA_MADNESS_SEASON;
}

function buildSeedsMap(
  seeds: Array<{ seedKey: string; teamCode: string | null | undefined }>,
) {
  return new Map(
    seeds
      .filter((seed) => Boolean(seed.teamCode))
      .map((seed) => [seed.seedKey, seed.teamCode as string]),
  );
}

function getLockAtFromSlots(slots: Array<{ scheduledAt: Date | null }>) {
  const times = slots
    .map((slot) => slot.scheduledAt?.getTime())
    .filter((time): time is number => typeof time === "number")
    .sort((a, b) => a - b);

  return times.length > 0 ? new Date(times[0]) : null;
}

function hasBracketLocked(lockAt: Date | null) {
  return Boolean(lockAt && Date.now() >= lockAt.getTime());
}

function getTeamDivisionForGameDivision(division: Division) {
  switch (division) {
    case "PREMIER_T20":
      return "Premier";
    case "DIV1_T20":
      return "Division-1";
    case "DIV2_T20":
      return "Division-2";
    case "DIV3_T20":
      return "Division-3";
    case "F40":
      return "F40";
    case "T30":
      return "T30";
    default:
      return null;
  }
}

function formatDisplayName(profile: {
  firstName: string | null;
  lastName: string | null;
  email: string;
}) {
  if (profile.firstName && profile.lastName) {
    return `${profile.firstName} ${profile.lastName}`;
  }
  return profile.firstName ?? profile.email.split("@")[0];
}

export async function saveMichcaMadnessDivisionSetup(
  _prevState: MichcaMadnessActionState,
  formData: FormData,
): Promise<MichcaMadnessActionState> {
  try {
    await requireMichcaMadnessAdmin();
  } catch (error) {
    if (error instanceof AuthenticationRequiredError) {
      return { ...INITIAL_ERROR, message: "Please sign in." };
    }
    return { ...INITIAL_ERROR, message: "You do not have access to this admin section." };
  }

  let division: MichcaMadnessDivision;
  try {
    division = normalizeDivision(formData.get("division"));
  } catch (error) {
    return { ...INITIAL_ERROR, message: (error as Error).message };
  }

  const season = parseSeason(formData.get("season"));
  const requestedStatus = normalizeStatus(formData.get("status"));
  const template = requireMichcaMadnessTemplate(division);

  const seedRows = template.seeds.map((seed) => ({
    ...seed,
    teamCode: normalizeOptionalString(formData.get(`seed:${seed.key}`)),
  }));
  const filledTeamCodes = seedRows.flatMap((seed) => seed.teamCode ?? []);
  if (new Set(filledTeamCodes).size !== filledTeamCodes.length) {
    return { ...INITIAL_ERROR, message: "A team can only be used once in the bracket." };
  }

  const unknownVenues = template.slots
    .map((slot) => normalizeOptionalString(formData.get(`slot:${slot.key}:venue`)))
    .filter((venue): venue is string => venue !== null)
    .filter((venue) => !KNOWN_VENUES.has(venue));
  if (unknownVenues.length > 0) {
    return { ...INITIAL_ERROR, message: "One or more venues are invalid." };
  }

  const teamCodes = filledTeamCodes;
  const teams = await prisma.team.findMany({
    where: { teamCode: { in: teamCodes } },
    select: { teamCode: true, division: true },
  });
  const expectedTeamDivision = getTeamDivisionForGameDivision(division);
  const foundTeamCodes = new Set(teams.map((team) => team.teamCode));
  const mismatchedTeam = teams.find((team) => team.division !== expectedTeamDivision);

  if (teamCodes.some((teamCode) => !foundTeamCodes.has(teamCode))) {
    return { ...INITIAL_ERROR, message: "One or more selected teams do not exist." };
  }
  if (mismatchedTeam) {
    return { ...INITIAL_ERROR, message: "One or more selected teams do not match this division." };
  }

  const existingConfig = await prisma.michcaMadnessBracketConfig.findUnique({
    where: { season_division: { season, division } },
    include: {
      seeds: true,
      entries: { select: { id: true }, take: 1 },
    },
  });

  if (existingConfig?.entries.length) {
    const existingSeeds = buildSeedsMap(existingConfig.seeds);
    const changedSeeds = seedRows.some(
      (seed) => (existingSeeds.get(seed.key) ?? null) !== seed.teamCode,
    );
    if (changedSeeds) {
      return {
        ...INITIAL_ERROR,
        message: "Seeds cannot be changed after users have submitted brackets.",
      };
    }
  }

  const linkedGameIds = template.slots
    .map((slot) => normalizeOptionalString(formData.get(`slot:${slot.key}:gameId`)))
    .filter((gameId): gameId is string => Boolean(gameId));
  const linkedGames = linkedGameIds.length
    ? await prisma.game.findMany({
        where: { id: { in: linkedGameIds } },
        select: { id: true, division: true, gameType: true, date: true, venue: true },
      })
    : [];
  const linkedGameMap = new Map(linkedGames.map((game) => [game.id, game]));

  for (const gameId of linkedGameIds) {
    const game = linkedGameMap.get(gameId);
    if (!game || game.division !== division || game.gameType !== "PLAYOFF") {
      return {
        ...INITIAL_ERROR,
        message: "Linked games must be playoff games from the selected division.",
      };
    }
  }

  const config = await prisma.$transaction(async (tx) => {
    const upsertedConfig = await tx.michcaMadnessBracketConfig.upsert({
      where: { season_division: { season, division } },
      create: {
        season,
        division,
        templateKey: template.key,
        status: MichcaMadnessConfigStatus.COMING_SOON,
      },
      update: {
        templateKey: template.key,
      },
    });

    for (const seed of seedRows) {
      if (seed.teamCode) {
        await tx.michcaMadnessSeed.upsert({
          where: {
            configId_seedKey: {
              configId: upsertedConfig.id,
              seedKey: seed.key,
            },
          },
          create: {
            configId: upsertedConfig.id,
            seedKey: seed.key,
            pool: seed.pool,
            seed: seed.seed,
            teamCode: seed.teamCode,
          },
          update: {
            pool: seed.pool,
            seed: seed.seed,
            teamCode: seed.teamCode,
          },
        });
      } else {
        await tx.michcaMadnessSeed.deleteMany({
          where: { configId: upsertedConfig.id, seedKey: seed.key },
        });
      }
    }

    for (const slot of template.slots) {
      const date = normalizeRequiredString(formData.get(`slot:${slot.key}:date`));
      const time = normalizeRequiredString(formData.get(`slot:${slot.key}:time`));
      const venue = normalizeOptionalString(formData.get(`slot:${slot.key}:venue`));
      const gameId = normalizeOptionalString(formData.get(`slot:${slot.key}:gameId`));
      const linkedGame = gameId ? linkedGameMap.get(gameId) : null;
      let scheduledAt: Date | null = linkedGame?.date ?? null;

      if (date || time) {
        if (!date || !time) {
          throw new Error(`${slot.displayName} needs both date and time.`);
        }
        scheduledAt = parseDetroitDateTime(date, `${time}:00`);
      }

      await tx.michcaMadnessGameSlot.upsert({
        where: {
          configId_slotKey: {
            configId: upsertedConfig.id,
            slotKey: slot.key,
          },
        },
        create: {
          configId: upsertedConfig.id,
          slotKey: slot.key,
          round: slot.round,
          displayName: slot.displayName,
          sortOrder: slot.sortOrder,
          team1Source: slot.team1Source,
          team2Source: slot.team2Source,
          gameId,
          scheduledAt,
          venue: venue ?? linkedGame?.venue ?? null,
        },
        update: {
          round: slot.round,
          displayName: slot.displayName,
          sortOrder: slot.sortOrder,
          team1Source: slot.team1Source,
          team2Source: slot.team2Source,
          gameId,
          scheduledAt,
          venue: venue ?? linkedGame?.venue ?? null,
        },
      });
    }

    const seeds = await tx.michcaMadnessSeed.findMany({
      where: { configId: upsertedConfig.id },
      select: { seedKey: true, teamCode: true },
    });
    const slots = await tx.michcaMadnessGameSlot.findMany({
      where: { configId: upsertedConfig.id },
      select: { scheduledAt: true },
    });
    const seedsByKey = buildSeedsMap(seeds);
    const lockAt = getLockAtFromSlots(slots);
    const canOpen = areSeedsComplete(template, seedsByKey) && Boolean(lockAt);
    const status = requestedStatus === MichcaMadnessConfigStatus.READY && !canOpen
      ? MichcaMadnessConfigStatus.COMING_SOON
      : requestedStatus;

    return tx.michcaMadnessBracketConfig.update({
      where: { id: upsertedConfig.id },
      data: {
        status,
        lockAt,
      },
    });
  });

  revalidateMichcaMadness();

  const statusNote =
    requestedStatus === MichcaMadnessConfigStatus.READY &&
    config.status !== MichcaMadnessConfigStatus.READY
      ? " Seeds and at least one game time are required before opening submissions."
      : "";

  return {
    status: "success",
    message: `${template.label} setup saved.${statusNote}`,
  };
}

export async function updateMichcaMadnessBracket(
  _prevState: MichcaMadnessActionState,
  formData: FormData,
): Promise<MichcaMadnessActionState> {
  try {
    await requireMichcaMadnessAdmin();
  } catch (error) {
    if (error instanceof AuthenticationRequiredError) {
      return { ...INITIAL_ERROR, message: "Please sign in." };
    }
    return { ...INITIAL_ERROR, message: "You do not have access to this admin section." };
  }

  let division: MichcaMadnessDivision;
  try {
    division = normalizeDivision(formData.get("division"));
  } catch (error) {
    return { ...INITIAL_ERROR, message: (error as Error).message };
  }

  const season = parseSeason(formData.get("season"));
  const template = requireMichcaMadnessTemplate(division);
  const config = await prisma.michcaMadnessBracketConfig.findUnique({
    where: { season_division: { season, division } },
    include: {
      seeds: true,
      slots: { orderBy: { sortOrder: "asc" } },
      entries: { include: { picks: true, userProfile: true } },
    },
  });

  if (!config) {
    return { ...INITIAL_ERROR, message: "Set up this division before updating the bracket." };
  }

  const gameIds = config.slots.flatMap((slot) => slot.gameId ?? []);
  const games = gameIds.length
    ? await prisma.game.findMany({
        where: { id: { in: gameIds } },
        select: {
          id: true,
          status: true,
          resultType: true,
          winnerCode: true,
          team1Code: true,
          team2Code: true,
          date: true,
          venue: true,
        },
      })
    : [];
  const gameMap = new Map(games.map((game) => [game.id, game]));
  const seedsByKey = buildSeedsMap(config.seeds);
  const winnersBySlot = new Map<string, string>();
  const attentionSlots = new Set<string>();

  for (const slot of config.slots) {
    if (!slot.gameId) continue;
    const game = gameMap.get(slot.gameId);
    if (!game) {
      attentionSlots.add(slot.slotKey);
      continue;
    }
    if (
      game.status === GameStatus.COMPLETED &&
      game.resultType === GameResult.WIN &&
      game.winnerCode
    ) {
      winnersBySlot.set(slot.slotKey, game.winnerCode);
    } else if (
      game.status === GameStatus.COMPLETED ||
      game.resultType === GameResult.DRAW ||
      game.resultType === GameResult.ABANDONED ||
      game.resultType === GameResult.CANCELLED
    ) {
      attentionSlots.add(slot.slotKey);
    }
  }

  const resolvedSlots = resolveBracketSlots(template, seedsByKey, winnersBySlot);

  await prisma.$transaction(async (tx) => {
    for (const slot of template.slots) {
      const resolved = resolvedSlots.get(slot.key);
      const existing = config.slots.find((row) => row.slotKey === slot.key);
      const linkedGame = existing?.gameId ? gameMap.get(existing.gameId) : null;
      await tx.michcaMadnessGameSlot.upsert({
        where: {
          configId_slotKey: {
            configId: config.id,
            slotKey: slot.key,
          },
        },
        create: {
          configId: config.id,
          slotKey: slot.key,
          round: slot.round,
          displayName: slot.displayName,
          sortOrder: slot.sortOrder,
          team1Source: slot.team1Source,
          team2Source: slot.team2Source,
          team1Code: resolved?.team1Code ?? null,
          team2Code: resolved?.team2Code ?? null,
          winnerCode: winnersBySlot.get(slot.key) ?? null,
          gameId: existing?.gameId ?? null,
          scheduledAt: existing?.scheduledAt ?? linkedGame?.date ?? null,
          venue: existing?.venue ?? linkedGame?.venue ?? null,
          needsAttention: attentionSlots.has(slot.key),
        },
        update: {
          round: slot.round,
          displayName: slot.displayName,
          sortOrder: slot.sortOrder,
          team1Source: slot.team1Source,
          team2Source: slot.team2Source,
          team1Code: resolved?.team1Code ?? null,
          team2Code: resolved?.team2Code ?? null,
          winnerCode: winnersBySlot.get(slot.key) ?? null,
          needsAttention: attentionSlots.has(slot.key),
        },
      });
    }

    for (const entry of config.entries) {
      let hasWrongPick = false;
      for (const pick of entry.picks) {
        const actualWinner = winnersBySlot.get(pick.slotKey);
        if (!actualWinner) continue;
        const isCorrect = pick.predictedWinnerCode === actualWinner;
        if (!isCorrect) hasWrongPick = true;
        await tx.michcaMadnessPick.update({
          where: { id: pick.id },
          data: {
            isCorrect,
            resolvedAt: new Date(),
          },
        });
      }

      await tx.michcaMadnessEntry.update({
        where: { id: entry.id },
        data: {
          status: hasWrongPick
            ? MichcaMadnessEntryStatus.ELIMINATED
            : MichcaMadnessEntryStatus.ALIVE,
        },
      });
    }
  });

  revalidateMichcaMadness();
  return {
    status: "success",
    message: `${template.label} bracket updated from completed playoff games.`,
  };
}

export async function submitMichcaMadnessBracket(
  _prevState: MichcaMadnessActionState,
  formData: FormData,
): Promise<MichcaMadnessActionState> {
  let profile;
  try {
    profile = await getOrCreateCurrentUserProfile();
  } catch {
    return { ...INITIAL_ERROR, message: "Please sign in before submitting a bracket." };
  }

  let division: MichcaMadnessDivision;
  try {
    division = normalizeDivision(formData.get("division"));
  } catch (error) {
    return { ...INITIAL_ERROR, message: (error as Error).message };
  }

  const season = parseSeason(formData.get("season"));
  const template = requireMichcaMadnessTemplate(division);
  const config = await prisma.michcaMadnessBracketConfig.findUnique({
    where: { season_division: { season, division } },
    include: {
      seeds: true,
      slots: true,
      entries: {
        where: { userProfileId: profile.id },
        include: { picks: true },
      },
    },
  });

  if (!config || config.status !== MichcaMadnessConfigStatus.READY) {
    return { ...INITIAL_ERROR, message: "This bracket is not open yet." };
  }

  const lockAt = config.lockAt ?? getLockAtFromSlots(config.slots);
  if (hasBracketLocked(lockAt)) {
    return { ...INITIAL_ERROR, message: "This bracket is locked." };
  }

  const seedsByKey = buildSeedsMap(config.seeds);
  if (!areSeedsComplete(template, seedsByKey)) {
    return { ...INITIAL_ERROR, message: "This bracket is still missing playoff teams." };
  }

  const picksBySlot = new Map(
    template.slots.map((slot) => [
      slot.key,
      normalizeRequiredString(formData.get(`pick:${slot.key}`)),
    ]),
  );
  const validation = validateBracketPicks(template, seedsByKey, picksBySlot);
  if (!validation.isValid) {
    return {
      ...INITIAL_ERROR,
      message: validation.errors[0] ?? "Please complete the bracket.",
    };
  }

  await prisma.$transaction(async (tx) => {
    const entry = await tx.michcaMadnessEntry.upsert({
      where: {
        configId_userProfileId: {
          configId: config.id,
          userProfileId: profile.id,
        },
      },
      create: {
        configId: config.id,
        userProfileId: profile.id,
        status: MichcaMadnessEntryStatus.ALIVE,
      },
      update: {
        status: MichcaMadnessEntryStatus.ALIVE,
        submittedAt: new Date(),
      },
    });

    await tx.michcaMadnessPick.deleteMany({
      where: { entryId: entry.id },
    });

    await tx.michcaMadnessPick.createMany({
      data: template.slots.map((slot) => ({
        entryId: entry.id,
        slotKey: slot.key,
        predictedWinnerCode: picksBySlot.get(slot.key) as string,
      })),
    });
  });

  revalidateMichcaMadness();
  return { status: "success", message: `${template.label} bracket saved.` };
}

export async function saveMichcaMadnessPick({
  season = MICHCA_MADNESS_SEASON,
  division,
  slotKey,
  predictedWinnerCode,
}: {
  season?: number;
  division: MichcaMadnessDivision;
  slotKey: string;
  predictedWinnerCode: string;
}): Promise<MichcaMadnessPickSaveResponse> {
  let profile;
  try {
    profile = await getOrCreateCurrentUserProfile();
  } catch {
    return { success: false, message: "Please sign in before saving a bracket." };
  }

  const template = requireMichcaMadnessTemplate(division);
  const slot = template.slots.find((item) => item.key === slotKey);
  if (!slot) {
    return { success: false, message: "Unknown bracket game." };
  }

  const config = await prisma.michcaMadnessBracketConfig.findUnique({
    where: { season_division: { season, division } },
    include: {
      seeds: true,
      slots: true,
      entries: {
        where: { userProfileId: profile.id },
        include: { picks: true },
      },
    },
  });

  if (!config || config.status !== MichcaMadnessConfigStatus.READY) {
    return { success: false, message: "This bracket is not open yet." };
  }

  const lockAt = config.lockAt ?? getLockAtFromSlots(config.slots);
  if (hasBracketLocked(lockAt)) {
    return { success: false, message: "This bracket is locked." };
  }

  const seedsByKey = buildSeedsMap(config.seeds);
  if (!areSeedsComplete(template, seedsByKey)) {
    return { success: false, message: "This bracket is still missing playoff teams." };
  }

  const downstreamSlotKeys = getDownstreamSlotKeys(template, slotKey);
  const existingEntry = config.entries[0] ?? null;
  const nextPicks = new Map(
    existingEntry?.picks.map((pick) => [
      pick.slotKey,
      pick.predictedWinnerCode,
    ]) ?? [],
  );

  nextPicks.set(slotKey, predictedWinnerCode);
  for (const key of downstreamSlotKeys) {
    nextPicks.delete(key);
  }

  const validation = validatePartialBracketPicks(template, seedsByKey, nextPicks);
  if (!validation.isValid) {
    return {
      success: false,
      message: validation.errors[0] ?? "That pick cannot be saved yet.",
    };
  }

  const savedPicks = await prisma.$transaction(async (tx) => {
    const entry = await tx.michcaMadnessEntry.upsert({
      where: {
        configId_userProfileId: {
          configId: config.id,
          userProfileId: profile.id,
        },
      },
      create: {
        configId: config.id,
        userProfileId: profile.id,
        status: MichcaMadnessEntryStatus.ALIVE,
      },
      update: {
        status: MichcaMadnessEntryStatus.ALIVE,
        submittedAt: new Date(),
      },
    });

    await tx.michcaMadnessPick.deleteMany({
      where: {
        entryId: entry.id,
        slotKey: { in: [slotKey, ...downstreamSlotKeys] },
      },
    });

    await tx.michcaMadnessPick.create({
      data: {
        entryId: entry.id,
        slotKey,
        predictedWinnerCode,
      },
    });

    return tx.michcaMadnessPick.findMany({
      where: { entryId: entry.id },
      orderBy: { createdAt: "asc" },
      select: {
        slotKey: true,
        predictedWinnerCode: true,
      },
    });
  });

  const savedPickMap = new Map(
    savedPicks.map((pick) => [pick.slotKey, pick.predictedWinnerCode]),
  );
  const postSaveValidation = validatePartialBracketPicks(
    template,
    seedsByKey,
    savedPickMap,
  );
  const remainingCount = getRemainingPickCount(template, savedPickMap);

  revalidateMichcaMadness();
  return {
    success: true,
    message: postSaveValidation.isComplete
      ? "Bracket complete and saved."
      : `Saved · ${template.slots.length - remainingCount} of ${template.slots.length} picks complete.`,
    savedPicks,
    completedCount: template.slots.length - remainingCount,
    totalCount: template.slots.length,
    isComplete: postSaveValidation.isComplete,
  };
}

export async function getAdminMichcaMadnessData(season = MICHCA_MADNESS_SEASON) {
  await requireMichcaMadnessAdmin();

  const [configs, teams, playoffGames] = await Promise.all([
    prisma.michcaMadnessBracketConfig.findMany({
      where: { season },
      include: {
        seeds: { orderBy: [{ pool: "asc" }, { seed: "asc" }] },
        slots: { orderBy: { sortOrder: "asc" } },
        _count: { select: { entries: true } },
      },
      orderBy: { division: "asc" },
    }),
    prisma.team.findMany({
      where: {
        OR: [
          { division: { in: ["Premier", "Division-1", "Division-2", "Division-3"] } },
          { division: { in: ["F40", "T30"] } },
        ],
      },
      orderBy: [{ division: "asc" }, { teamName: "asc" }],
      select: {
        teamCode: true,
        teamName: true,
        teamShortCode: true,
        division: true,
        format: true,
      },
    }),
    prisma.game.findMany({
      where: {
        gameType: "PLAYOFF",
        division: { in: [...MICHCA_MADNESS_DIVISIONS] },
      },
      orderBy: { date: "asc" },
      select: {
        id: true,
        date: true,
        division: true,
        status: true,
        resultType: true,
        winnerCode: true,
        venue: true,
        team1Code: true,
        team2Code: true,
        team1: { select: { teamName: true, teamShortCode: true } },
        team2: { select: { teamName: true, teamShortCode: true } },
      },
    }),
  ]);

  return { season, configs, teams, playoffGames };
}

export async function getMichcaMadnessPageData(season = MICHCA_MADNESS_SEASON) {
  const profile = await getOrCreateCurrentUserProfile();
  const configs = await prisma.michcaMadnessBracketConfig.findMany({
    where: { season },
    include: {
      seeds: true,
      slots: { orderBy: { sortOrder: "asc" } },
      entries: {
        where: { userProfileId: profile.id },
        include: { picks: true },
      },
    },
  });

  const allTeamCodes = new Set<string>();
  for (const config of configs) {
    for (const seed of config.seeds) allTeamCodes.add(seed.teamCode);
    for (const slot of config.slots) {
      if (slot.team1Code) allTeamCodes.add(slot.team1Code);
      if (slot.team2Code) allTeamCodes.add(slot.team2Code);
      if (slot.winnerCode) allTeamCodes.add(slot.winnerCode);
    }
    for (const entry of config.entries) {
      for (const pick of entry.picks) allTeamCodes.add(pick.predictedWinnerCode);
    }
  }

  const teams = await prisma.team.findMany({
    where: { teamCode: { in: Array.from(allTeamCodes) } },
    select: {
      teamCode: true,
      teamName: true,
      teamShortCode: true,
      logo: true,
    },
  });

  const leaderboards = await Promise.all(
    configs.map(async (config) => {
      const lockAt = config.lockAt ?? getLockAtFromSlots(config.slots);
      if (!hasBracketLocked(lockAt)) {
        return {
          configId: config.id,
          entries: [],
        };
      }

      const template = requireMichcaMadnessTemplate(config.division);
      const seedsByKey = buildSeedsMap(config.seeds);
      const entries = await prisma.michcaMadnessEntry.findMany({
        where: {
          configId: config.id,
          status: MichcaMadnessEntryStatus.ALIVE,
        },
        orderBy: [{ submittedAt: "asc" }, { userProfile: { email: "asc" } }],
        select: {
          id: true,
          submittedAt: true,
          picks: {
            select: {
              slotKey: true,
              predictedWinnerCode: true,
            },
          },
          userProfile: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              t20TeamCode: true,
            },
          },
        },
        take: 100,
      });

      const completeEntries = entries.filter((entry) => {
        const picksBySlot = new Map(
          entry.picks.map((pick) => [pick.slotKey, pick.predictedWinnerCode]),
        );
        return validatePartialBracketPicks(template, seedsByKey, picksBySlot).isComplete;
      });

      return {
        configId: config.id,
        entries: completeEntries.map((entry, index) => ({
          id: entry.id,
          rank: index + 1,
          displayName: formatDisplayName(entry.userProfile),
          teamCode: entry.userProfile.t20TeamCode,
          submittedAt: entry.submittedAt.toISOString(),
        })),
      };
    }),
  );

  const leaderboardMap = new Map(
    leaderboards.map((leaderboard) => [leaderboard.configId, leaderboard.entries]),
  );

  return {
    season,
    profileId: profile.id,
    teams,
    divisions: MICHCA_MADNESS_DIVISIONS.map((division) => {
      const template = requireMichcaMadnessTemplate(division);
      const config = configs.find((item) => item.division === division);
      const seedsByKey = buildSeedsMap(config?.seeds ?? []);
      const winnersBySlot = new Map(
        (config?.slots ?? [])
          .filter((slot) => slot.winnerCode)
          .map((slot) => [slot.slotKey, slot.winnerCode as string]),
      );
      const resolvedSlots = resolveBracketSlots(template, seedsByKey, winnersBySlot);
      const entry = config?.entries[0] ?? null;
      const lockAt = config?.lockAt ?? getLockAtFromSlots(config?.slots ?? []);
      const isReady =
        config?.status === MichcaMadnessConfigStatus.READY &&
        areSeedsComplete(template, seedsByKey) &&
        Boolean(lockAt);

      return {
        division,
        template,
        config: config
          ? {
              id: config.id,
              status: config.status,
              lockAt: lockAt?.toISOString() ?? null,
              isLocked: hasBracketLocked(lockAt),
              isReady,
            }
          : null,
        seeds: template.seeds.map((seed) => ({
          ...seed,
          teamCode: seedsByKey.get(seed.key) ?? null,
        })),
        slots: template.slots.map((slot) => {
          const dbSlot = config?.slots.find((item) => item.slotKey === slot.key);
          const resolved = resolvedSlots.get(slot.key);
          return {
            ...slot,
            team1Code: dbSlot?.team1Code ?? resolved?.team1Code ?? null,
            team2Code: dbSlot?.team2Code ?? resolved?.team2Code ?? null,
            winnerCode: dbSlot?.winnerCode ?? null,
            scheduledAt: dbSlot?.scheduledAt?.toISOString() ?? null,
            venue: dbSlot?.venue ?? null,
            needsAttention: dbSlot?.needsAttention ?? false,
          };
        }),
        entry: entry
          ? {
              id: entry.id,
              status: entry.status,
              submittedAt: entry.submittedAt.toISOString(),
              picks: entry.picks.map((pick) => ({
                slotKey: pick.slotKey,
                predictedWinnerCode: pick.predictedWinnerCode,
                isCorrect: pick.isCorrect,
              })),
            }
          : null,
        leaderboard: config ? (leaderboardMap.get(config.id) ?? []) : [],
      };
    }),
    openingSlotKeysByDivision: Object.fromEntries(
      MICHCA_MADNESS_DIVISIONS.map((division) => [
        division,
        getOpeningSlotKeys(requireMichcaMadnessTemplate(division)),
      ]),
    ),
  };
}
