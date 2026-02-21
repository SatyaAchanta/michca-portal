import { UserRole } from "@/generated/prisma/client";

export const ROLE_RANK: Record<UserRole, number> = {
  [UserRole.PLAYER]: 1,
  [UserRole.UMPIRE]: 2,
  [UserRole.ADMIN]: 3,
};

export function hasRoleAtLeast(current: UserRole, required: UserRole) {
  return ROLE_RANK[current] >= ROLE_RANK[required];
}
