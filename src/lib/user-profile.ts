import "server-only";

import { auth, currentUser } from "@clerk/nextjs/server";

import { UserRole, type UserProfile } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { hasRoleAtLeast, isAnyAdminRole } from "@/lib/roles";

export class AuthenticationRequiredError extends Error {
  constructor(message = "Authentication required") {
    super(message);
    this.name = "AuthenticationRequiredError";
  }
}

export class InsufficientRoleError extends Error {
  constructor(
    public readonly currentRole: UserRole,
    public readonly minimumRole: UserRole
  ) {
    super(`Requires role ${minimumRole} or higher.`);
    this.name = "InsufficientRoleError";
  }
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function getAdminAllowlist() {
  return (process.env.ADMIN_EMAIL_ALLOWLIST ?? "")
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
}

function getUmpiringCommitteeAllowlist() {
  return (process.env.UMPIRING_COMMITTEE_EMAIL_ALLOWLIST ?? "")
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
}

function getWaiverCommitteeAllowlist() {
  return (process.env.WAIVER_COMMITTEE_EMAIL_ALLOWLIST ?? "")
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminAllowlisted(email: string) {
  return getAdminAllowlist().includes(normalizeEmail(email));
}

function resolveRoleForEmail(email: string): UserRole {
  const normalized = normalizeEmail(email);
  if (getAdminAllowlist().includes(normalized)) return UserRole.ADMIN;
  if (getUmpiringCommitteeAllowlist().includes(normalized)) return UserRole.UMPIRING_COMMITTEE;
  if (getWaiverCommitteeAllowlist().includes(normalized)) return UserRole.WAIVER_COMMITTEE;
  return UserRole.PLAYER;
}

function getPrimaryEmail(user: Awaited<ReturnType<typeof currentUser>>) {
  if (!user) {
    return null;
  }

  const preferred =
    user.emailAddresses.find(
      (address) => address.id === user.primaryEmailAddressId
    ) ?? user.emailAddresses[0];

  return preferred?.emailAddress ?? null;
}

export async function getOrCreateCurrentUserProfile(): Promise<UserProfile> {
  const { userId } = await auth();
  if (!userId) {
    throw new AuthenticationRequiredError();
  }

  const clerkUser = await currentUser();
  if (!clerkUser) {
    throw new AuthenticationRequiredError("Unable to resolve Clerk user.");
  }

  const rawEmail = getPrimaryEmail(clerkUser);
  if (!rawEmail) {
    throw new AuthenticationRequiredError("User email is required.");
  }

  const email = normalizeEmail(rawEmail);
  const firstName = clerkUser.firstName ?? null;
  const lastName = clerkUser.lastName ?? null;
  const allowlistRole = resolveRoleForEmail(email);

  const existing = await prisma.userProfile.findUnique({
    where: { clerkUserId: userId },
  });

  if (!existing) {
    return prisma.userProfile.create({
      data: {
        clerkUserId: userId,
        email,
        firstName,
        lastName,
        role: allowlistRole,
      },
    });
  }

  const roleNeedsUpdate = allowlistRole !== UserRole.PLAYER && existing.role !== allowlistRole;

  // Only sync email and role from Clerk. firstName/lastName are managed by
  // the user via the account form and should not be overwritten here.
  return prisma.userProfile.update({
    where: { id: existing.id },
    data: {
      email,
      ...(roleNeedsUpdate ? { role: allowlistRole } : {}),
    },
  });
}

export async function requireRole(minRole: UserRole): Promise<UserProfile> {
  const profile = await getOrCreateCurrentUserProfile();
  if (!hasRoleAtLeast(profile.role, minRole)) {
    throw new InsufficientRoleError(profile.role, minRole);
  }
  return profile;
}

export async function requireAnyAdminRole(): Promise<UserProfile> {
  const profile = await getOrCreateCurrentUserProfile();
  if (!isAnyAdminRole(profile.role)) {
    throw new InsufficientRoleError(profile.role, UserRole.ADMIN);
  }
  return profile;
}
