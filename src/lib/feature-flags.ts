export function isMichcaMadnessEnabled(
  value = process.env.MICHCA_MADNESS_ENABLED,
) {
  return value === "true";
}
