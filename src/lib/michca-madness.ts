import type { Division } from "@/generated/prisma/client";

export const MICHCA_MADNESS_SEASON = 2026;

export const MICHCA_MADNESS_DIVISIONS = [
  "PREMIER_T20",
  "DIV1_T20",
  "DIV2_T20",
  "DIV3_T20",
  "F40",
  "T30",
] as const satisfies readonly Division[];

export type MichcaMadnessDivision = (typeof MICHCA_MADNESS_DIVISIONS)[number];

export type SeedDef = {
  key: string;
  label: string;
  pool: string | null;
  seed: number;
};

export type SlotDef = {
  key: string;
  round: string;
  displayName: string;
  team1Source: string;
  team2Source: string;
  sortOrder: number;
};

export type BracketTemplate = {
  key: string;
  division: MichcaMadnessDivision;
  label: string;
  formatSummary: string;
  seeds: SeedDef[];
  slots: SlotDef[];
};

export type ResolvedSlot = SlotDef & {
  team1Code: string | null;
  team2Code: string | null;
};

export const DIVISION_LABELS: Record<MichcaMadnessDivision, string> = {
  PREMIER_T20: "Premier T20",
  DIV1_T20: "Division 1",
  DIV2_T20: "Division 2",
  DIV3_T20: "Division 3",
  F40: "F40",
  T30: "T30",
};

function singlePoolSeeds(count: number) {
  return Array.from({ length: count }, (_, index) => {
    const seed = index + 1;
    return {
      key: `S${seed}`,
      label: `Rank ${seed}`,
      pool: null,
      seed,
    };
  });
}

function twoPoolSeeds(count: number) {
  return ["A", "B"].flatMap((pool) =>
    Array.from({ length: count }, (_, index) => {
      const seed = index + 1;
      return {
        key: `${pool}${seed}`,
        label: `Pool ${pool} #${seed}`,
        pool,
        seed,
      };
    }),
  );
}

const COMMON_FINAL_SLOTS: SlotDef[] = [
  {
    key: "SF2",
    round: "Semi Finals",
    displayName: "Semi Final 2",
    team1Source: "WIN:QF3",
    team2Source: "WIN:QF2",
    sortOrder: 90,
  },
  {
    key: "SF1",
    round: "Semi Finals",
    displayName: "Semi Final 1",
    team1Source: "WIN:QF4",
    team2Source: "WIN:QF1",
    sortOrder: 100,
  },
  {
    key: "F",
    round: "Finals",
    displayName: "Final",
    team1Source: "WIN:SF2",
    team2Source: "WIN:SF1",
    sortOrder: 110,
  },
];

const PREMIER_TEMPLATE: BracketTemplate = {
  key: "PREMIER_TOP_8",
  division: "PREMIER_T20",
  label: DIVISION_LABELS.PREMIER_T20,
  formatSummary:
    "Premier T20 is a straight top-eight knockout bracket: 6 plays 3, 7 plays 2, 5 plays 4, and 8 plays 1 before semi finals and the final.",
  seeds: singlePoolSeeds(8),
  slots: [
    {
      key: "QF3",
      round: "Quarter Finals",
      displayName: "Quarter Final 3",
      team1Source: "S6",
      team2Source: "S3",
      sortOrder: 10,
    },
    {
      key: "QF2",
      round: "Quarter Finals",
      displayName: "Quarter Final 2",
      team1Source: "S7",
      team2Source: "S2",
      sortOrder: 20,
    },
    {
      key: "QF4",
      round: "Quarter Finals",
      displayName: "Quarter Final 4",
      team1Source: "S5",
      team2Source: "S4",
      sortOrder: 30,
    },
    {
      key: "QF1",
      round: "Quarter Finals",
      displayName: "Quarter Final 1",
      team1Source: "S8",
      team2Source: "S1",
      sortOrder: 40,
    },
    ...COMMON_FINAL_SLOTS,
  ],
};

const T30_TEMPLATE: BracketTemplate = {
  key: "T30_TOP_8",
  division: "T30",
  label: DIVISION_LABELS.T30,
  formatSummary:
    "T30 sends rank 1 directly into the quarter finals. Admin selects ranks 2 through 8 after the extra game, then QFs are 1v8, 2v7, 3v6, and 4v5.",
  seeds: singlePoolSeeds(8),
  slots: [
    {
      key: "QF1",
      round: "Quarter Finals",
      displayName: "Quarter Final 1",
      team1Source: "S1",
      team2Source: "S8",
      sortOrder: 10,
    },
    {
      key: "QF2",
      round: "Quarter Finals",
      displayName: "Quarter Final 2",
      team1Source: "S2",
      team2Source: "S7",
      sortOrder: 20,
    },
    {
      key: "QF3",
      round: "Quarter Finals",
      displayName: "Quarter Final 3",
      team1Source: "S3",
      team2Source: "S6",
      sortOrder: 30,
    },
    {
      key: "QF4",
      round: "Quarter Finals",
      displayName: "Quarter Final 4",
      team1Source: "S4",
      team2Source: "S5",
      sortOrder: 40,
    },
    ...COMMON_FINAL_SLOTS,
  ],
};

const F40_TEMPLATE: BracketTemplate = {
  key: "F40_PAGE_PLAYOFF",
  division: "F40",
  label: DIVISION_LABELS.F40,
  formatSummary:
    "F40 uses a four-team Page playoff: 1 plays 2 for a final spot, 3 plays 4 in an eliminator, then the 1v2 loser plays the eliminator winner for the other final spot.",
  seeds: singlePoolSeeds(4),
  slots: [
    {
      key: "G1",
      round: "Page Playoff",
      displayName: "Game 1",
      team1Source: "S1",
      team2Source: "S2",
      sortOrder: 10,
    },
    {
      key: "G2",
      round: "Eliminator",
      displayName: "Game 2",
      team1Source: "S3",
      team2Source: "S4",
      sortOrder: 20,
    },
    {
      key: "G3",
      round: "Qualifier",
      displayName: "Game 3",
      team1Source: "LOSS:G1",
      team2Source: "WIN:G2",
      sortOrder: 30,
    },
    {
      key: "G4",
      round: "Finals",
      displayName: "Final",
      team1Source: "WIN:G1",
      team2Source: "WIN:G3",
      sortOrder: 40,
    },
  ],
};

function divisionOneStyleTemplate(
  division: "DIV1_T20" | "DIV2_T20",
): BracketTemplate {
  return {
    key: `${division}_TWO_POOL_TOP_7`,
    division,
    label: DIVISION_LABELS[division],
    formatSummary:
      `${DIVISION_LABELS[division]} uses two pools. Pool ranks 2-7 play eliminators, each pool's rank 1 enters in the quarter finals, then winners move through semi finals to the final.`,
    seeds: twoPoolSeeds(7),
    slots: [
      {
        key: "ELIM_A2",
        round: "Eliminator",
        displayName: "Eliminator A2",
        team1Source: "A7",
        team2Source: "A2",
        sortOrder: 10,
      },
      {
        key: "ELIM_B2",
        round: "Eliminator",
        displayName: "Eliminator B2",
        team1Source: "B7",
        team2Source: "B2",
        sortOrder: 20,
      },
      {
        key: "ELIM_A3",
        round: "Eliminator",
        displayName: "Eliminator A3",
        team1Source: "A6",
        team2Source: "A3",
        sortOrder: 30,
      },
      {
        key: "ELIM_B3",
        round: "Eliminator",
        displayName: "Eliminator B3",
        team1Source: "B6",
        team2Source: "B3",
        sortOrder: 40,
      },
      {
        key: "ELIM_A4",
        round: "Eliminator",
        displayName: "Eliminator A4",
        team1Source: "A5",
        team2Source: "A4",
        sortOrder: 50,
      },
      {
        key: "ELIM_B4",
        round: "Eliminator",
        displayName: "Eliminator B4",
        team1Source: "B5",
        team2Source: "B4",
        sortOrder: 60,
      },
      {
        key: "QF3",
        round: "Quarter Finals",
        displayName: "Quarter Final 3",
        team1Source: "WIN:ELIM_B3",
        team2Source: "WIN:ELIM_A2",
        sortOrder: 70,
      },
      {
        key: "QF2",
        round: "Quarter Finals",
        displayName: "Quarter Final 2",
        team1Source: "WIN:ELIM_A4",
        team2Source: "B1",
        sortOrder: 80,
      },
      {
        key: "QF4",
        round: "Quarter Finals",
        displayName: "Quarter Final 4",
        team1Source: "WIN:ELIM_A3",
        team2Source: "WIN:ELIM_B2",
        sortOrder: 85,
      },
      {
        key: "QF1",
        round: "Quarter Finals",
        displayName: "Quarter Final 1",
        team1Source: "WIN:ELIM_B4",
        team2Source: "A1",
        sortOrder: 88,
      },
      ...COMMON_FINAL_SLOTS,
    ],
  };
}

const DIV3_TEMPLATE: BracketTemplate = {
  key: "DIV3_TWO_POOL_TOP_6",
  division: "DIV3_T20",
  label: DIVISION_LABELS.DIV3_T20,
  formatSummary:
    "Division 3 uses two pools. Pool ranks 3-6 play eliminators, pool ranks 1 and 2 enter in the quarter finals, then winners move through semi finals to the final.",
  seeds: twoPoolSeeds(6),
  slots: [
    {
      key: "ELIM_B1",
      round: "Eliminator",
      displayName: "Eliminator B1",
      team1Source: "B6",
      team2Source: "B3",
      sortOrder: 10,
    },
    {
      key: "ELIM_A2",
      round: "Eliminator",
      displayName: "Eliminator A2",
      team1Source: "A5",
      team2Source: "A4",
      sortOrder: 20,
    },
    {
      key: "ELIM_A1",
      round: "Eliminator",
      displayName: "Eliminator A1",
      team1Source: "A6",
      team2Source: "A3",
      sortOrder: 30,
    },
    {
      key: "ELIM_B2",
      round: "Eliminator",
      displayName: "Eliminator B2",
      team1Source: "B5",
      team2Source: "B4",
      sortOrder: 40,
    },
    {
      key: "QF3",
      round: "Quarter Finals",
      displayName: "Quarter Final 3",
      team1Source: "WIN:ELIM_B1",
      team2Source: "A2",
      sortOrder: 50,
    },
    {
      key: "QF2",
      round: "Quarter Finals",
      displayName: "Quarter Final 2",
      team1Source: "WIN:ELIM_A2",
      team2Source: "B1",
      sortOrder: 60,
    },
    {
      key: "QF4",
      round: "Quarter Finals",
      displayName: "Quarter Final 4",
      team1Source: "WIN:ELIM_A1",
      team2Source: "B2",
      sortOrder: 70,
    },
    {
      key: "QF1",
      round: "Quarter Finals",
      displayName: "Quarter Final 1",
      team1Source: "WIN:ELIM_B2",
      team2Source: "A1",
      sortOrder: 80,
    },
    ...COMMON_FINAL_SLOTS,
  ],
};

export function getMichcaMadnessTemplate(
  division: Division,
): BracketTemplate | null {
  switch (division) {
    case "PREMIER_T20":
      return PREMIER_TEMPLATE;
    case "DIV1_T20":
      return divisionOneStyleTemplate("DIV1_T20");
    case "DIV2_T20":
      return divisionOneStyleTemplate("DIV2_T20");
    case "DIV3_T20":
      return DIV3_TEMPLATE;
    case "F40":
      return F40_TEMPLATE;
    case "T30":
      return T30_TEMPLATE;
    default:
      return null;
  }
}

export function requireMichcaMadnessTemplate(division: Division) {
  const template = getMichcaMadnessTemplate(division);
  if (!template) {
    throw new Error(`Unsupported MichCA-Madness division: ${division}`);
  }
  return template;
}

function resolveSource(
  source: string,
  seedsByKey: Map<string, string>,
  winnersBySlot: Map<string, string>,
  resolvedBySlot: Map<string, ResolvedSlot>,
) {
  if (source.startsWith("WIN:")) {
    return winnersBySlot.get(source.slice(4)) ?? null;
  }

  if (source.startsWith("LOSS:")) {
    const slotKey = source.slice(5);
    const slot = resolvedBySlot.get(slotKey);
    const winner = winnersBySlot.get(slotKey);
    if (!slot || !winner) return null;
    if (slot.team1Code === winner) return slot.team2Code;
    if (slot.team2Code === winner) return slot.team1Code;
    return null;
  }

  return seedsByKey.get(source) ?? null;
}

export function resolveBracketSlots(
  template: BracketTemplate,
  seedsByKey: Map<string, string>,
  winnersBySlot: Map<string, string>,
) {
  const resolvedBySlot = new Map<string, ResolvedSlot>();

  for (const slot of [...template.slots].sort((a, b) => a.sortOrder - b.sortOrder)) {
    const resolved: ResolvedSlot = {
      ...slot,
      team1Code: resolveSource(
        slot.team1Source,
        seedsByKey,
        winnersBySlot,
        resolvedBySlot,
      ),
      team2Code: resolveSource(
        slot.team2Source,
        seedsByKey,
        winnersBySlot,
        resolvedBySlot,
      ),
    };
    resolvedBySlot.set(slot.key, resolved);
  }

  return resolvedBySlot;
}

export function validateBracketPicks(
  template: BracketTemplate,
  seedsByKey: Map<string, string>,
  picksBySlot: Map<string, string>,
) {
  const errors: string[] = [];
  const expectedSlotKeys = new Set(template.slots.map((slot) => slot.key));

  for (const key of picksBySlot.keys()) {
    if (!expectedSlotKeys.has(key)) {
      errors.push(`Unknown bracket game ${key}.`);
    }
  }

  const predictedWinners = new Map<string, string>();
  const resolvedBySlot = new Map<string, ResolvedSlot>();

  for (const slot of [...template.slots].sort((a, b) => a.sortOrder - b.sortOrder)) {
    const resolved: ResolvedSlot = {
      ...slot,
      team1Code: resolveSource(
        slot.team1Source,
        seedsByKey,
        predictedWinners,
        resolvedBySlot,
      ),
      team2Code: resolveSource(
        slot.team2Source,
        seedsByKey,
        predictedWinners,
        resolvedBySlot,
      ),
    };
    resolvedBySlot.set(slot.key, resolved);

    const pick = picksBySlot.get(slot.key);
    if (!pick) {
      errors.push(`${slot.displayName} needs a pick.`);
      continue;
    }

    if (!resolved.team1Code || !resolved.team2Code) {
      errors.push(`${slot.displayName} cannot be resolved from earlier picks.`);
      continue;
    }

    if (pick !== resolved.team1Code && pick !== resolved.team2Code) {
      errors.push(`${slot.displayName} has an invalid winner.`);
      continue;
    }

    predictedWinners.set(slot.key, pick);
  }

  return {
    isValid: errors.length === 0,
    errors,
    predictedWinners,
    resolvedSlots: resolvedBySlot,
  };
}

export function getOpeningSlotKeys(template: BracketTemplate) {
  return template.slots
    .filter(
      (slot) =>
        !slot.team1Source.startsWith("WIN:") &&
        !slot.team1Source.startsWith("LOSS:") &&
        !slot.team2Source.startsWith("WIN:") &&
        !slot.team2Source.startsWith("LOSS:"),
    )
    .map((slot) => slot.key);
}

export function getSourceLabel(source: string, template: BracketTemplate) {
  if (source.startsWith("WIN:")) {
    const slot = template.slots.find((s) => s.key === source.slice(4));
    return slot ? `Winner of ${slot.displayName}` : source;
  }

  if (source.startsWith("LOSS:")) {
    const slot = template.slots.find((s) => s.key === source.slice(5));
    return slot ? `Loser of ${slot.displayName}` : source;
  }

  return template.seeds.find((seed) => seed.key === source)?.label ?? source;
}

export function areSeedsComplete(
  template: BracketTemplate,
  seedsByKey: Map<string, string>,
) {
  return template.seeds.every((seed) => Boolean(seedsByKey.get(seed.key)));
}

