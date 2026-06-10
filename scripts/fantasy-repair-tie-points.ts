import { config as loadEnv } from "dotenv";

import { PrismaPg } from "@prisma/adapter-pg";

import { GameResult, PrismaClient, GameStatus } from "../src/generated/prisma/client";
import {
  calculateBoostersRemaining,
  calculateFantasyPointsFromPredictions,
  calculateFullParticipationWeeks,
} from "../src/lib/fantasy-scoring";

loadEnv();
loadEnv({ path: ".env.local", override: true });

type RepairMode = "dry-run" | "apply";

type CliOptions = {
  help: boolean;
  mode: RepairMode;
};

type RecomputedProfile = {
  id: string;
  beforeFantasyPoints: number;
  afterFantasyPoints: number;
  beforeFullParticipationWeeks: number;
  afterFullParticipationWeeks: number;
  beforeBoostersRemaining: number;
  afterBoostersRemaining: number;
};

const TRANSACTION_TIMEOUT_MS = 30_000;

function parseCliOptions(argv: string[]): CliOptions {
  return {
    help: argv.includes("--help") || argv.includes("-h"),
    mode: argv.includes("--apply") ? "apply" : "dry-run",
  };
}

function printHelp() {
  console.log("Repair fantasy points that were previously awarded for tie/no-result games.");
  console.log("");
  console.log("Usage:");
  console.log("  npm run fantasy:repair-ties");
  console.log("  npm run fantasy:repair-ties -- --apply");
  console.log("");
  console.log("Options:");
  console.log("  --apply   Persist the repair instead of printing a dry-run summary.");
  console.log("  --help    Show this help message.");
}

function printSummary(input: {
  mode: RepairMode;
  impactedGames: number;
  impactedPredictions: number;
  impactedUsers: number;
  recomputedProfiles: RecomputedProfile[];
}) {
  console.log(`Fantasy tie repair mode: ${input.mode}`);
  console.log(`Impacted games: ${input.impactedGames}`);
  console.log(`Impacted predictions: ${input.impactedPredictions}`);
  console.log(`Impacted users: ${input.impactedUsers}`);

  if (input.recomputedProfiles.length === 0) {
    return;
  }

  console.table(
    input.recomputedProfiles.map((profile) => ({
      userProfileId: profile.id,
      fantasyPoints: `${profile.beforeFantasyPoints} -> ${profile.afterFantasyPoints}`,
      fullParticipationWeeks: `${profile.beforeFullParticipationWeeks} -> ${profile.afterFullParticipationWeeks}`,
      boostersRemaining: `${profile.beforeBoostersRemaining} -> ${profile.afterBoostersRemaining}`,
    })),
  );
}

async function main() {
  const options = parseCliOptions(process.argv.slice(2));
  if (options.help) {
    printHelp();
    return;
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is required to repair fantasy tie scoring.");
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
    log: ["error", "warn"],
  });

  const tiePredictions = await prisma.prediction.findMany({
    where: {
      isScored: true,
      game: {
        status: GameStatus.COMPLETED,
        OR: [
          { resultType: GameResult.ABANDONED },
          {
            isDraw: true,
            resultType: {
              not: GameResult.DRAW,
            },
          },
        ],
      },
    },
    select: {
      id: true,
      userProfileId: true,
      gameId: true,
      pointsEarned: true,
      isCorrect: true,
    },
  });

  if (tiePredictions.length === 0) {
    console.log("No scored tie/no-result predictions found.");
    await prisma.$disconnect();
    return;
  }

  const impactedUserIds = [...new Set(tiePredictions.map((prediction) => prediction.userProfileId))];
  const impactedGameIds = [...new Set(tiePredictions.map((prediction) => prediction.gameId))];

  const [profiles, affectedUserPredictions, boostedPredictions, completedGames] =
    await Promise.all([
      prisma.userProfile.findMany({
        where: { id: { in: impactedUserIds } },
        select: {
          id: true,
          fantasyPoints: true,
          fullParticipationWeeks: true,
          boostersRemaining: true,
        },
      }),
      prisma.prediction.findMany({
        where: {
          userProfileId: { in: impactedUserIds },
        },
        select: {
          id: true,
          userProfileId: true,
          isScored: true,
          pointsEarned: true,
          isBoosted: true,
          game: {
            select: {
              id: true,
              date: true,
              gameType: true,
              resultType: true,
              isDraw: true,
            },
          },
        },
      }),
      prisma.prediction.findMany({
        where: {
          userProfileId: { in: impactedUserIds },
          isBoosted: true,
        },
        select: {
          userProfileId: true,
        },
      }),
      prisma.game.findMany({
        where: {
          status: GameStatus.COMPLETED,
        },
        select: {
          id: true,
          date: true,
          gameType: true,
          resultType: true,
          isDraw: true,
        },
      }),
    ]);

  const boostedCounts = new Map<string, number>();
  for (const prediction of boostedPredictions) {
    boostedCounts.set(
      prediction.userProfileId,
      (boostedCounts.get(prediction.userProfileId) ?? 0) + 1,
    );
  }

  const tiePredictionIds = new Set(tiePredictions.map((prediction) => prediction.id));
  const predictionsByUser = new Map<string, typeof affectedUserPredictions>();
  for (const prediction of affectedUserPredictions) {
    const normalizedPrediction = tiePredictionIds.has(prediction.id)
      ? {
          ...prediction,
          pointsEarned: 0,
        }
      : prediction;
    const existing = predictionsByUser.get(prediction.userProfileId) ?? [];
    existing.push(normalizedPrediction);
    predictionsByUser.set(prediction.userProfileId, existing);
  }

  const recomputedProfiles = profiles.map((profile) => {
    const userPredictions = predictionsByUser.get(profile.id) ?? [];
    const fullParticipationWeeks = calculateFullParticipationWeeks(
      userPredictions,
      completedGames,
    );
    const boostersRemaining = calculateBoostersRemaining({
      fullParticipationWeeks,
      boostedPredictionCount: boostedCounts.get(profile.id) ?? 0,
    });

    return {
      id: profile.id,
      beforeFantasyPoints: profile.fantasyPoints,
      afterFantasyPoints: calculateFantasyPointsFromPredictions(userPredictions),
      beforeFullParticipationWeeks: profile.fullParticipationWeeks,
      afterFullParticipationWeeks: fullParticipationWeeks,
      beforeBoostersRemaining: profile.boostersRemaining,
      afterBoostersRemaining: boostersRemaining,
    };
  });

  printSummary({
    mode: options.mode,
    impactedGames: impactedGameIds.length,
    impactedPredictions: tiePredictions.length,
    impactedUsers: impactedUserIds.length,
    recomputedProfiles,
  });

  if (options.mode === "dry-run") {
    await prisma.$disconnect();
    return;
  }

  await prisma.$transaction(
    [
      prisma.prediction.updateMany({
        where: {
          id: {
            in: [...tiePredictionIds],
          },
        },
        data: {
          isScored: true,
          isCorrect: false,
          pointsEarned: 0,
        },
      }),
      ...recomputedProfiles.map((profile) =>
        prisma.userProfile.update({
          where: { id: profile.id },
          data: {
            fantasyPoints: profile.afterFantasyPoints,
            fullParticipationWeeks: profile.afterFullParticipationWeeks,
            boostersRemaining: profile.afterBoostersRemaining,
          },
        }),
      ),
    ],
    { timeout: TRANSACTION_TIMEOUT_MS },
  );

  console.log("Fantasy tie repair applied.");
  await prisma.$disconnect();
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
