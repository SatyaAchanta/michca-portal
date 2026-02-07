export const PAGE_SIZE = 10;
export const DETROIT_TIMEZONE = "America/Detroit";

export const SCHEDULE_STATUSES = ["SCHEDULED", "COMPLETED"] as const;
export type ScheduleStatusFilter = (typeof SCHEDULE_STATUSES)[number];
export const GAME_STATUSES = ["SCHEDULED", "LIVE", "COMPLETED", "CANCELLED"] as const;
export type ScheduleGameStatus = (typeof GAME_STATUSES)[number];
export type ScheduleSortOrder = "asc" | "desc";

export const DIVISIONS = [
  "F40",
  "PREMIER_T20",
  "DIV1_T20",
  "DIV2_T20",
  "DIV3_T20",
  "T30",
  "U15",
  "GLT",
] as const;
export type DivisionCode = (typeof DIVISIONS)[number];

export const DIVISION_LABELS: Record<DivisionCode, string> = {
  F40: "F40",
  PREMIER_T20: "Premier T20",
  DIV1_T20: "Division I T20",
  DIV2_T20: "Division II T20",
  DIV3_T20: "Division III T20",
  T30: "T30",
  U15: "U15",
  GLT: "GLT",
};

export type ScheduleFilters = {
  season: number;
  status: ScheduleStatusFilter;
  division?: DivisionCode;
  teamQuery?: string;
  startDate?: string;
  endDate?: string;
  page: number;
  pageSize?: number;
};

export type ScheduleGameListItem = {
  id: string;
  date: string;
  displayDateTime: string;
  division: string;
  gameType: "LEAGUE" | "PLAYOFF";
  status: ScheduleGameStatus;
  venue: string;
  homeTeam: string;
  awayTeam: string;
  winnerTeamName?: string;
  isDraw: boolean;
  isCancelled: boolean;
};

export type ScheduleQueryResult = {
  items: ScheduleGameListItem[];
  season: number;
  isPastSeason: boolean;
  sortOrder: ScheduleSortOrder;
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
};
