export type Match = {
  id: string;
  homeTeam: string;
  awayTeam: string;
  date: string;
  venue: string;
  division: string;
};

export type DocumentItem = {
  id: string;
  title: string;
  description?: string;
  category: string;
  fileType: "PDF" | "DOC" | "XLS";
  url: string;
};

export type Assignment = {
  id: string;
  matchLabel: string;
  date: string;
  venue: string;
  role: string;
};

export const matches: Match[] = [
  {
    id: "match-1",
    homeTeam: "Lansing Lions",
    awayTeam: "Ann Arbor Aces",
    date: "2025-05-03T10:30:00",
    venue: "North Field",
    division: "Premier",
  },
  {
    id: "match-2",
    homeTeam: "Detroit Dynamos",
    awayTeam: "Kalamazoo Kings",
    date: "2025-05-03T13:30:00",
    venue: "Riverside Oval",
    division: "Premier",
  },
  {
    id: "match-3",
    homeTeam: "Grand Rapids Guardians",
    awayTeam: "Flint Falcons",
    date: "2025-05-10T11:00:00",
    venue: "Heritage Park",
    division: "Division 1",
  },
  {
    id: "match-4",
    homeTeam: "Midwest Mavericks",
    awayTeam: "Pontiac Panthers",
    date: "2025-05-10T14:30:00",
    venue: "Lakeview Grounds",
    division: "Division 1",
  },
  {
    id: "match-5",
    homeTeam: "Saginaw Strikers",
    awayTeam: "Battle Creek Blazers",
    date: "2025-05-17T10:00:00",
    venue: "Centennial Park",
    division: "Division 2",
  },
  {
    id: "match-6",
    homeTeam: "Huron Hurricanes",
    awayTeam: "Traverse Titans",
    date: "2025-05-17T13:00:00",
    venue: "Evergreen Oval",
    division: "Division 2",
  },
];

export const documents: DocumentItem[] = [
  {
    id: "doc-1",
    title: "Player Registration",
    description: "Season roster and eligibility requirements.",
    category: "Registration",
    fileType: "PDF",
    url: "/docs/player-registration.pdf",
  },
  {
    id: "doc-2",
    title: "League Rules",
    description: "Playing conditions, points, and tie breakers.",
    category: "Rules",
    fileType: "PDF",
    url: "/docs/league-rules.pdf",
  },
  {
    id: "doc-3",
    title: "Match Report Form",
    description: "Submit results and notable incidents.",
    category: "Match Day",
    fileType: "DOC",
    url: "/docs/match-report-form.doc",
  },
  {
    id: "doc-4",
    title: "Code of Conduct",
    description: "Sportsmanship expectations and penalties.",
    category: "Rules",
    fileType: "PDF",
    url: "/docs/code-of-conduct.pdf",
  },
  {
    id: "doc-5",
    title: "Umpire Guidelines",
    description: "Procedures and match-day standards.",
    category: "Umpiring",
    fileType: "PDF",
    url: "/docs/umpire-guidelines.pdf",
  },
  {
    id: "doc-6",
    title: "Ground Booking Request",
    description: "Reserve venues for training sessions.",
    category: "Other",
    fileType: "XLS",
    url: "/docs/ground-booking.xlsx",
  },
];

export const assignments: Assignment[] = [
  {
    id: "assign-1",
    matchLabel: "Lansing Lions vs Ann Arbor Aces",
    date: "2025-05-03T10:30:00",
    venue: "North Field",
    role: "Center Umpire",
  },
  {
    id: "assign-2",
    matchLabel: "Grand Rapids Guardians vs Flint Falcons",
    date: "2025-05-10T11:00:00",
    venue: "Heritage Park",
    role: "Square Leg",
  },
  {
    id: "assign-3",
    matchLabel: "Saginaw Strikers vs Battle Creek Blazers",
    date: "2025-04-12T10:00:00",
    venue: "Centennial Park",
    role: "Reserve",
  },
];
