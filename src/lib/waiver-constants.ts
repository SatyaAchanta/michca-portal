export const WAIVER_SUBMIT_TEXT =
  "By signing below, I am acknowledging that an inherent risk of exposure to COVID-19 exists in any public place where people are present. By attending Mich-CA 2026 League I am voluntarily assuming all risks related to exposure to COVID-19 and agree not to hold Mich-CA 2026 GB; BOD; Charter Members; or any of their directors, shareholders, agents, members, managers, affiliates, volunteers, officials, and representatives liable for any illness or injury.";

export const WAIVER_RULEBOOK_URL =
  "https://michcausa.org/docs/rules-regulations.pdf";

export const WAIVER_RULEBOOK_ACKNOWLEDGEMENT_TEXT =
  "I have read the 2026 Mich-CA rulebook and understand all the conditions.";

export const WAIVER_US_STATES = [
  "Alabama",
  "Alaska",
  "Arizona",
  "Arkansas",
  "California",
  "Colorado",
  "Connecticut",
  "Delaware",
  "Florida",
  "Georgia",
  "Hawaii",
  "Idaho",
  "Illinois",
  "Indiana",
  "Iowa",
  "Kansas",
  "Kentucky",
  "Louisiana",
  "Maine",
  "Maryland",
  "Massachusetts",
  "Michigan",
  "Minnesota",
  "Mississippi",
  "Missouri",
  "Montana",
  "Nebraska",
  "Nevada",
  "New Hampshire",
  "New Jersey",
  "New Mexico",
  "New York",
  "North Carolina",
  "North Dakota",
  "Ohio",
  "Oklahoma",
  "Oregon",
  "Pennsylvania",
  "Rhode Island",
  "South Carolina",
  "South Dakota",
  "Tennessee",
  "Texas",
  "Utah",
  "Vermont",
  "Virginia",
  "Washington",
  "West Virginia",
  "Wisconsin",
  "Wyoming",
] as const;

export const WAIVER_ROLE_OPTIONS = [
  "Batsman",
  "Bowler",
  "Wicket Keeper",
  "All Rounder",
] as const;

export const WAIVER_PRIMARY_DIVISIONS = [
  "Premier",
  "Division-1",
  "Division-2",
  "Division-3",
] as const;

export const WAIVER_SECONDARY_DIVISIONS = ["F40", "T30"] as const;

export type WaiverPrimaryDivisionValue = (typeof WAIVER_PRIMARY_DIVISIONS)[number];
export type WaiverSecondaryDivisionValue = (typeof WAIVER_SECONDARY_DIVISIONS)[number];
export type WaiverUsStateValue = (typeof WAIVER_US_STATES)[number];
export type WaiverRoleValue = (typeof WAIVER_ROLE_OPTIONS)[number];

export function getCurrentWaiverYear() {
  return new Date().getFullYear();
}
