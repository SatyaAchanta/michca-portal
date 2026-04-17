export const CLUB_INFO_PHONE_PATTERN =
  /^(?:\+?1[\s.-]?)?(?:\(\d{3}\)|\d{3})[\s.-]?\d{3}[\s.-]?\d{4}$/;

export function splitCaptainName(fullName: string) {
  const normalized = fullName.trim().replace(/\s+/g, " ");
  const [firstName, ...rest] = normalized.split(" ");
  return {
    firstName: firstName ?? null,
    lastName: rest.length > 0 ? rest.join(" ") : null,
  };
}
