import { readFile } from "node:fs/promises";
import path from "node:path";

import { config as loadEnv } from "dotenv";

import {
  DEFAULT_SCHEDULE_CSV_PATH,
  DETROIT_TIMEZONE,
  buildScheduleImportPlan,
  formatDryRunPreview,
  parseScheduleCsv,
  parseScheduleRows,
  validateScheduleGames,
  type ExistingScheduleGame,
  type ScheduleImportGame,
} from "../src/lib/schedule-import";

loadEnv();
loadEnv({ path: ".env.local", override: true });

type ImportMode = "dry-run" | "apply";

type CliOptions = {
  mode: ImportMode;
  csvPath: string;
};

const UPDATE_CHUNK_SIZE = 50;
const TRANSACTION_TIMEOUT_MS = 30_000;

function parseCliOptions(argv: string[]): CliOptions {
  const mode = argv.includes("--apply") ? "apply" : "dry-run";
  const csvPathArg = argv.find((arg) => !arg.startsWith("--"));

  return {
    mode,
    csvPath: csvPathArg ?? DEFAULT_SCHEDULE_CSV_PATH,
  };
}

function getSeasonBounds(games: ScheduleImportGame[]) {
  const years = games.map((game) =>
    Number.parseInt(
      new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        timeZone: DETROIT_TIMEZONE,
      }).format(game.date),
      10
    )
  );
  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);

  return {
    start: new Date(Date.UTC(minYear, 0, 1)),
    end: new Date(Date.UTC(maxYear + 1, 0, 1)),
  };
}

function printValidationErrors(errors: string[]) {
  if (errors.length === 0) {
    return;
  }

  console.error("Validation failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
}

function printSummary(input: {
  mode: ImportMode;
  csvPath: string;
  games: ScheduleImportGame[];
  creates: ScheduleImportGame[];
  updates: unknown[];
}) {
  console.log(`Schedule import mode: ${input.mode}`);
  console.log(`CSV path: ${input.csvPath}`);
  console.log(`Total parsed games: ${input.games.length}`);
  console.log(`Games to create: ${input.creates.length}`);
  console.log(`Games to update: ${input.updates.length}`);
  console.log("First 5 games, latest first:");
  console.table(formatDryRunPreview(input.games, 5));
}

function toCreateManyData(game: ScheduleImportGame) {
  return {
    date: game.date,
    division: game.division,
    league: game.league,
    status: "SCHEDULED" as const,
    venue: game.venue,
    team1Code: game.team1Code,
    team2Code: game.team2Code,
    gameType: game.gameType,
    isCancelled: false,
  };
}

function chunk<T>(items: T[], size: number) {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

async function main() {
  const options = parseCliOptions(process.argv.slice(2));
  const csvPath = path.resolve(process.cwd(), options.csvPath);
  const csvContent = await readFile(csvPath, "utf8");
  const games = parseScheduleRows(parseScheduleCsv(csvContent));

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is required to import the schedule.");
  }

  const [{ PrismaPg }, { PrismaClient }] = await Promise.all([
    import("@prisma/adapter-pg"),
    import("../src/generated/prisma/client"),
  ]);
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
    log: ["error", "warn"],
  });
  const teams = await prisma.team.findMany({ select: { teamCode: true } });
  const validation = validateScheduleGames(
    games,
    new Set(teams.map((team) => team.teamCode))
  );

  if (validation.errors.length > 0) {
    printValidationErrors(validation.errors);
    process.exitCode = 1;
    await prisma.$disconnect();
    return;
  }

  const { start, end } = getSeasonBounds(games);
  const existingGames = await prisma.game.findMany({
    where: {
      date: {
        gte: start,
        lt: end,
      },
    },
    select: {
      id: true,
      date: true,
      division: true,
      gameType: true,
      team1Code: true,
      team2Code: true,
    },
  });
  const plan = buildScheduleImportPlan(games, existingGames as ExistingScheduleGame[]);

  printSummary({
    mode: options.mode,
    csvPath: options.csvPath,
    games: plan.games,
    creates: plan.creates,
    updates: plan.updates,
  });

  if (options.mode === "dry-run") {
    await prisma.$disconnect();
    return;
  }

  if (plan.creates.length > 0) {
    await prisma.game.createMany({
      data: plan.creates.map((game) => toCreateManyData(game)),
    });
  }

  for (const updateChunk of chunk(plan.updates, UPDATE_CHUNK_SIZE)) {
    await prisma.$transaction(
      updateChunk.map(({ existing, incoming }) =>
        prisma.game.update({
          where: { id: existing.id },
          data: {
            league: incoming.league,
            venue: incoming.venue,
          },
        })
      ),
      { timeout: TRANSACTION_TIMEOUT_MS }
    );
  }

  console.log("Schedule import completed.");
  await prisma.$disconnect();
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
