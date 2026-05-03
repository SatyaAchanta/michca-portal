import { UserRole } from "@/generated/prisma/client";

export const ROLE_RANK: Record<UserRole, number> = {
  [UserRole.PLAYER]: 1,
  [UserRole.UMPIRE]: 2,
  [UserRole.ADMIN]: 3,
  [UserRole.UMPIRING_COMMITTEE]: 3,
  [UserRole.WAIVER_COMMITTEE]: 3,
  [UserRole.STATS_COMMITTEE]: 3,
  [UserRole.FANTASY_ADMIN]: 3,
};

export function hasRoleAtLeast(current: UserRole, required: UserRole) {
  return ROLE_RANK[current] >= ROLE_RANK[required];
}

export type AdminSection = "youth15" | "umpiring" | "waiver" | "clubInfo" | "teams" | "fantasy" | "games";

const SECTION_ALLOWED_ROLES: Record<AdminSection, UserRole[]> = {
  youth15: [UserRole.ADMIN],
  games: [UserRole.ADMIN],
  teams: [UserRole.ADMIN],
  umpiring: [UserRole.ADMIN, UserRole.UMPIRING_COMMITTEE],
  waiver: [UserRole.ADMIN, UserRole.WAIVER_COMMITTEE],
  clubInfo: [UserRole.ADMIN, UserRole.STATS_COMMITTEE],
  fantasy: [UserRole.ADMIN, UserRole.FANTASY_ADMIN],
};

export function canAccessAdminSection(
  role: UserRole,
  section: AdminSection
): boolean {
  return SECTION_ALLOWED_ROLES[section].includes(role);
}

export function isAnyAdminRole(role: UserRole): boolean {
  return (
    role === UserRole.ADMIN ||
    role === UserRole.UMPIRING_COMMITTEE ||
    role === UserRole.WAIVER_COMMITTEE ||
    role === UserRole.STATS_COMMITTEE ||
    role === UserRole.FANTASY_ADMIN
  );
}
