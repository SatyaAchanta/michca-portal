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
  fileType: "PDF" | "DOC" | "XLS" | "FORM";
  url: string;
  isDownloadable?: boolean;
};

export type Assignment = {
  id: string;
  matchLabel: string;
  date: string;
  venue: string;
  role: string;
};

export type Ground = {
  id: string;
  name: string;
  shortName: string;
  address: string;
};

export const matches: Match[] = [];

export const documents: DocumentItem[] = [
  {
    id: "doc-1",
    title: "Team Registration Form",
    description: "Register your team for the upcoming season.",
    category: "Registration",
    fileType: "FORM",
    url: "https://forms.gle/op9QNwjgnSHGHjMN7",
    isDownloadable: false,
  },
  {
    id: "doc-2",
    title: "Player Waiver Form",
    description: "Required waiver for all participating players.",
    category: "Registration",
    fileType: "FORM",
    url: "https://forms.gle/dcYcwcwRVz97fbDk6",
    isDownloadable: false,
  },
  {
    id: "doc-3",
    title: "Mich-CA Rules and Regulations",
    description: "Official league rules and playing conditions.",
    category: "Rules",
    fileType: "PDF",
    url: "/docs/rules-regulations.pdf",
    isDownloadable: true,
  },
  {
    id: "doc-4",
    title: "Mich-CA Performance and Social Media Guidelines",
    description: "Standards for player conduct on and off the field.",
    category: "Rules",
    fileType: "PDF",
    url: "/docs/social-media-guidelines.pdf",
    isDownloadable: true,
  },
  {
    id: "doc-5",
    title: "Mich-CA Declaration Sheet",
    description: "Team declaration form for match day.",
    category: "Match Day",
    fileType: "PDF",
    url: "/docs/declaration-sheet.pdf",
    isDownloadable: true,
  },
  {
    id: "doc-6",
    title: "Mich-CA Committee Members",
    description: "Current committee and contact information.",
    category: "Other",
    fileType: "PDF",
    url: "/docs/committee-members.pdf",
    isDownloadable: true,
  },
  {
    id: "doc-7",
    title: "Mich-CA Score Sheet",
    description: "Official scoring sheet for match recording.",
    category: "Match Day",
    fileType: "PDF",
    url: "/docs/score-sheet.pdf",
    isDownloadable: true,
  },
  {
    id: "doc-8",
    title: "Mich-CA Summary Sheet",
    description: "Match summary and result submission form.",
    category: "Match Day",
    fileType: "PDF",
    url: "/docs/summary-sheet.pdf",
    isDownloadable: true,
  },
];

export const assignments: Assignment[] = [];

export const grounds: Ground[] = [
  {
    id: "ground-1",
    name: "Belle Isle, Detroit",
    shortName: "Belle-Isle",
    address: "Belle Isle Athletic Shelter, Vista Dr, Detroit, MI 48207",
  },
  {
    id: "ground-2",
    name: "Bloomer Park, Rochester Hills",
    shortName: "Bloomer",
    address: "345 John R Rd, Rochester Hills, MI 48307",
  },
  {
    id: "ground-3",
    name: "Clinton Twp",
    shortName: "Clinton",
    address: "19000 Clinton River Rd, Clinton Twp, MI 48038",
  },
  {
    id: "ground-4",
    name: "Grand Rapids (Earle Brewer Park)",
    shortName: "Grand Rapids",
    address: "399, 84th street SE, Bryon Center, MI 49315",
  },
  {
    id: "ground-5",
    name: "Heritage Park, Canton",
    shortName: "Canton",
    address: "46202 Heritage Park Rd, Canton, MI 48188",
  },
  {
    id: "ground-6",
    name: "Jayne Field",
    shortName: "Jayne",
    address: "13405 Shields St, Hamtramck, MI 48212",
  },
  {
    id: "ground-7",
    name: "Joseph J. Delia Jr. Park, Sterling Heights",
    shortName: "Sterling Heights",
    address: "3001 18 Mile Rd, Sterling Heights, MI 48314",
  },
  {
    id: "ground-8",
    name: "Lasky Recreation Center, Detroit",
    shortName: "Lasky",
    address: "13200 Fenelon St, Detroit, MI 48212",
  },
  {
    id: "ground-9",
    name: "Lyon Oaks Country Park, Wixom",
    shortName: "Lyon Oaks",
    address: "52221 W Pontiac Trail, Wixom, MI 48993",
  },
  {
    id: "ground-10",
    name: "Millennium Park (Northville)",
    shortName: "Northville",
    address: "45769 Six Mile Rd, Northville, MI 48168",
  },
  {
    id: "ground-11",
    name: "Murphy Park, Pontiac",
    shortName: "Murphy",
    address: "348 Russell St, Pontiac, MI 48342",
  },
  {
    id: "ground-12",
    name: "Redford",
    shortName: "Redford",
    address: "9501 SIOUX Redford, MI 48239",
  },
  {
    id: "ground-13",
    name: "Trombly Park, Warren",
    shortName: "Trombly",
    address: "14801 Alvin Ave, Warren, MI 48089",
  },
  {
    id: "ground-14",
    name: "Winterfield Park (Toledo)",
    shortName: "Toledo",
    address: "4565 Hill Ave, Toledo, OH 43615",
  },
];
