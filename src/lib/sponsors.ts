export type SponsorTier = "gold" | "silver" | "dj";

export type Sponsor = {
  tier: SponsorTier;
  tierLabel: string;
  name: string;
  href?: string;
  logoSrc: string;
  logoAlt: string;
  homeDescription: string;
  aboutDescription: string;
  highlight?: string;
  offers?: string[];
};

export const sponsors: Sponsor[] = [
  {
    tier: "gold",
    tierLabel: "Gold Sponsor",
    name: "Authentikka Indian Cuisine & Banquet, Wixom",
    href: "https://authentikkawixom.com",
    logoSrc: "/docs/authentikka-logo.webp",
    logoAlt: "Authentikka Indian Cuisine & Banquet logo",
    homeDescription:
      "Authentikka Indian Cuisine & Banquet is partnering with Mich-CA for the first time this season, bringing food, hospitality, and community support to our league.",
    aboutDescription:
      "Authentikka Indian Cuisine & Banquet joins Mich-CA as our Gold Sponsor for a new season of collaboration centered on community, food, and cricket.",
    highlight: "First-time season partnership",
    offers: [
      "Use promo code MICH-CA for 10% off online orders.",
      "Wear your Mich-CA jersey for dine-in and get 10% off.",
    ],
  },
  {
    tier: "silver",
    tierLabel: "Silver Sponsor",
    name: "Lincode",
    href: "https://www.lincode.ai",
    logoSrc: "/docs/lincode-logo.webp",
    logoAlt: "Lincode logo",
    homeDescription:
      "Lincode continues its support of Mich-CA, helping us run organized league operations and strengthen the cricket community across Michigan.",
    aboutDescription:
      "Lincode returns as a continuing partner supporting league operations and community initiatives with its AI and computer vision expertise.",
    highlight: "Returning sponsor",
  },
  {
    tier: "dj",
    tierLabel: "DJ Partner",
    name: "Shiznay Events and Productions",
    href: "https://shiznayevents.com/",
    logoSrc: "/docs/shiznay-events.webp",
    logoAlt: "Shiznay Events and Productions logo",
    homeDescription:
      "Shiznay Events and Productions joins Mich-CA as our DJ partner, helping create a more energetic matchday and event atmosphere throughout the season.",
    aboutDescription:
      "Shiznay Events and Productions supports Mich-CA as DJ partner for league and community events.",
  },
];
