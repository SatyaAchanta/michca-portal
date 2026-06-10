import { config as loadEnv } from "dotenv";

import { PrismaPg } from "@prisma/adapter-pg";

import { GameResult, GameStatus, PrismaClient } from "../src/generated/prisma/client";
import { calculateBoostersRemainingWithAbandonedRefunds } from "../src/lib/fantasy-scoring";
import { isAbandonedResult } from "../src/lib/game-results";

loadEnv();
loadEnv({ path: ".env.local", override: true });

type RepairMode = "dry-run" | "apply";

type CliOptions = {
  help: boolean;
  mode: RepairMode;
};

type RecomputedProfile = {
  id: string;
  beforeBoostersRemaining: number;
  afterBoostersRemaining: number;
  boostedPredictionCount: number;
  refundedBoostedPredictionCount: number;
};

const TRANSACTION_TIMEOUT_MS = 30_000;

function parseCliOptions(argv: string[]): CliOptions {
  return {
    help: argv.includes("--help") || argv.includes("-h"),
    mode: argv.includes("--apply") ? "apply" : "dry-run",
  };
}

function printHelp() {
  console.log("Repair fantasy boosters that were consumed by abandoned games.");
  console.log("");
  console.log("Usage:");
  console.log("  npm run fantasy:repair-abandoned-boosters");
  console.log("  npm run fantasy:repair-abandoned-boosters -- --apply");
  console.log("");
  console.log("Options:");
  console.log("  --apply   Persist the repair instead of printing a dry-run summary.");
  console.log("  --help    Show this help message.");
}

function printSummary(input: {
  mode: RepairMode;
  impactedPredictions: number;
  impactedUsers: number;
  totalBoostersRestored: number;
  recomputedProfiles: RecomputedProfile[];
}) {
  console.log(`Fantasy abandoned booster repair mode: ${input.mode}`);
  console.log(`Impacted predictions: ${input.impactedPredictions}`);
  console.log(`Impacted users: ${input.impactedUsers}`);
  console.log(`Net boosters restored: ${input.totalBoostersRestored}`);

  if (input.recomputedProfiles.length === 0) {
    return;
  }

  console.table(
    input.recomputedProfiles.map((profile) => ({
      userProfileId: profile.id,
      boostersRemaining: `${profile.beforeBoostersRemaining} -> ${profile.afterBoostersRemaining}`,
      boostedPredictions: profile.boostedPredictionCount,
      refundedAbandonedBoosters: profile.refundedBoostedPredictionCount,
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
    throw new Error("DATABASE_URL is required to repair abandoned-game booster balances.");
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
    log: ["error", "warn"],
  });

  const impactedPredictions = await prisma.prediction.findMany({
    where: {
      isScored: true,
      isBoosted: true,
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
    },
  });

  if (impactedPredictions.length === 0) {
    console.log("No scored boosted abandoned predictions found.");
    await prisma.$disconnect();
    return;
  }

  const impactedUserIds = [...new Set(impactedPredictions.map((prediction) => prediction.userProfileId))];

  const [profiles, boostedPredictions] = await Promise.all([
    prisma.userProfile.findMany({
      where: { id: { in: impactedUserIds } },
      select: {
        id: true,
        fullParticipationWeeks: true,
        boostersRemaining: true,
      },
    }),
    prisma.prediction.findMany({
      where: {
        userProfileId: { in: impactedUserIds },
        isBoosted: true,
      },
      select: {
        userProfileId: true,
        game: {
          select: {
            resultType: true,
            isDraw: true,
            isCancelled: true,
            winnerCode: true,
          },
        },
      },
    }),
  ]);

  const boostedCounts = new Map<string, number>();
  const refundedCounts = new Map<string, number>();

  for (const prediction of boostedPredictions) {
    boostedCounts.set(
      prediction.userProfileId,
      (boostedCounts.get(prediction.userProfileId) ?? 0) + 1,
    );

    if (isAbandonedResult(prediction.game)) {
      refundedCounts.set(
        prediction.userProfileId,
        (refundedCounts.get(prediction.userProfileId) ?? 0) + 1,
      );
    }
  }

  const recomputedProfiles = profiles
    .map((profile) => {
      const boostedPredictionCount = boostedCounts.get(profile.id) ?? 0;
      const refundedBoostedPredictionCount = refundedCounts.get(profile.id) ?? 0;
      const afterBoostersRemaining =
        calculateBoostersRemainingWithAbandonedRefunds({
          fullParticipationWeeks: profile.fullParticipationWeeks,
          boostedPredictionCount,
          refundedBoostedPredictionCount,
        });

      return {
        id: profile.id,
        beforeBoostersRemaining: profile.boostersRemaining,
        afterBoostersRemaining,
        boostedPredictionCount,
        refundedBoostedPredictionCount,
      };
    })
    .filter(
      (profile) => profile.beforeBoostersRemaining !== profile.afterBoostersRemaining,
    )
    .sort((a, b) => a.id.localeCompare(b.id));

  printSummary({
    mode: options.mode,
    impactedPredictions: impactedPredictions.length,
    impactedUsers: recomputedProfiles.length,
    totalBoostersRestored: recomputedProfiles.reduce(
      (total, profile) =>
        total + (profile.afterBoostersRemaining - profile.beforeBoostersRemaining),
      0,
    ),
    recomputedProfiles,
  });

  if (options.mode === "dry-run" || recomputedProfiles.length === 0) {
    await prisma.$disconnect();
    return;
  }

  await prisma.$transaction(
    recomputedProfiles.map((profile) =>
      prisma.userProfile.update({
        where: { id: profile.id },
        data: {
          boostersRemaining: profile.afterBoostersRemaining,
        },
      }),
    ),
    { timeout: TRANSACTION_TIMEOUT_MS },
  );

  console.log("Fantasy abandoned booster repair applied.");
  await prisma.$disconnect();
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
