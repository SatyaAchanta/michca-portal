export const WAIVER_SUBMIT_TEXT =
  "By signing below, I am acknowledging that an inherent risk of exposure to COVID-19 exists in any public place where people are present. By attending Mich-CA 2026 League I am voluntarily assuming all risks related to exposure to COVID-19 and agree not to hold Mich-CA 2026 GB; BOD; Charter Members; or any of their directors, shareholders, agents, members, managers, affiliates, volunteers, officials, and representatives liable for any illness or injury.";

export const WAIVER_PRIMARY_DIVISIONS = [
  "Premier",
  "Division-1",
  "Division-2",
  "Division-3",
] as const;

export const WAIVER_SECONDARY_DIVISIONS = ["F40", "T30"] as const;

export type WaiverPrimaryDivisionValue = (typeof WAIVER_PRIMARY_DIVISIONS)[number];
export type WaiverSecondaryDivisionValue = (typeof WAIVER_SECONDARY_DIVISIONS)[number];

export function getCurrentWaiverYear() {
  return new Date().getFullYear();
}
