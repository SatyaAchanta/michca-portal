import { config as loadEnv } from "dotenv";

import { PrismaPg } from "@prisma/adapter-pg";

import { GameResult, PrismaClient } from "../src/generated/prisma/client";

loadEnv();
loadEnv({ path: ".env.local", override: true });

type BackfillMode = "dry-run" | "apply";

type CliOptions = {
  help: boolean;
  mode: BackfillMode;
};

function parseCliOptions(argv: string[]): CliOptions {
  return {
    help: argv.includes("--help") || argv.includes("-h"),
    mode: argv.includes("--apply") ? "apply" : "dry-run",
  };
}

function printHelp() {
  console.log("Backfill legacy draw/no-result games to the new ABANDONED result type.");
  console.log("");
  console.log("Usage:");
  console.log("  npm run games:backfill-abandoned");
  console.log("  npm run games:backfill-abandoned -- --apply");
  console.log("");
  console.log("Options:");
  console.log("  --apply   Persist the backfill instead of printing a dry-run summary.");
  console.log("  --help    Show this help message.");
}

async function main() {
  const options = parseCliOptions(process.argv.slice(2));
  if (options.help) {
    printHelp();
    return;
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is required to backfill abandoned games.");
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
    log: ["error", "warn"],
  });

  const games = await prisma.game.findMany({
    where: {
      isDraw: true,
      resultType: {
        not: GameResult.DRAW,
      },
    },
    orderBy: { date: "asc" },
    select: {
      id: true,
      date: true,
      team1Code: true,
      team2Code: true,
      resultType: true,
      winnerCode: true,
      isDraw: true,
    },
  });

  if (games.length === 0) {
    console.log("No legacy draw/no-result games found for abandoned backfill.");
    await prisma.$disconnect();
    return;
  }

  console.log(`Abandoned backfill mode: ${options.mode}`);
  console.log(`Games to update: ${games.length}`);
  console.table(
    games.map((game) => ({
      id: game.id,
      date: game.date.toISOString(),
      matchup: `${game.team1Code} vs ${game.team2Code}`,
      currentResultType: game.resultType,
      winnerCode: game.winnerCode ?? "—",
      isDraw: game.isDraw,
      nextResultType: GameResult.ABANDONED,
    })),
  );

  if (options.mode === "dry-run") {
    await prisma.$disconnect();
    return;
  }

  await prisma.game.updateMany({
    where: {
      id: { in: games.map((game) => game.id) },
    },
    data: {
      resultType: GameResult.ABANDONED,
      winnerCode: null,
      isDraw: false,
      isCancelled: false,
    },
  });

  console.log("Abandoned game backfill applied.");
  await prisma.$disconnect();
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
