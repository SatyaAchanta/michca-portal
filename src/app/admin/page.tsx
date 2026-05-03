import Link from "next/link";
import {
  ClipboardList,
  Gamepad2,
  CalendarPlus2,
  ShieldCheck,
  Users,
  FileText,
  UserCheck,
} from "lucide-react";
import { redirect } from "next/navigation";

import { PageContainer } from "@/components/page-container";
import { Card } from "@/components/ui/card";
import { canAccessAdminSection } from "@/lib/roles";
import {
  AuthenticationRequiredError,
  InsufficientRoleError,
  requireAnyAdminRole,
} from "@/lib/user-profile";

const ADMIN_SECTIONS = [
  {
    key: "youth15" as const,
    label: "Youth 15",
    description: "Club-level Youth 15 registrations.",
    href: "/admin/youth15",
    icon: Users,
  },
  {
    key: "umpiring" as const,
    label: "Umpiring",
    description: "Umpiring training signups and result management.",
    href: "/admin/umpiring",
    icon: ShieldCheck,
  },
  {
    key: "waiver" as const,
    label: "Waiver Status",
    description: "Player waiver submissions for the current season.",
    href: "/admin/waiver",
    icon: FileText,
  },
  {
    key: "clubInfo" as const,
    label: "Club Info",
    description: "Captain declarations submitted through the Club Info form.",
    href: "/admin/club-info",
    icon: ClipboardList,
  },
  {
    key: "games" as const,
    label: "Games",
    description: "Create scheduled games and cancel games when fixtures change.",
    href: "/admin/games",
    icon: CalendarPlus2,
  },
  {
    key: "teams" as const,
    label: "Teams",
    description: "Review imported teams and edit club profiles.",
    href: "/admin/teams",
    icon: UserCheck,
  },
  {
    key: "fantasy" as const,
    label: "Fantasy Scoring",
    description: "Set game results and calculate fantasy prediction points.",
    href: "/admin/fantasy",
    icon: Gamepad2,
  },
];

export default async function AdminPage() {
  let userProfile;
  try {
    userProfile = await requireAnyAdminRole();
  } catch (error) {
    if (error instanceof AuthenticationRequiredError) {
      redirect("/sign-in");
    }
    if (error instanceof InsufficientRoleError) {
      redirect("/");
    }
    throw error;
  }

  const accessibleSections = ADMIN_SECTIONS.filter((s) =>
    canAccessAdminSection(userProfile.role, s.key),
  );

  return (
    <div className="bg-background py-12">
      <PageContainer className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Admin
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
            Select a section to manage registrations and portal data.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {accessibleSections.map((section) => (
            <Link key={section.key} href={section.href}>
              <Card className="flex h-full cursor-pointer items-start gap-4 p-5 transition-colors hover:bg-accent">
                <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <section.icon className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-foreground">
                    {section.label}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {section.description}
                  </p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </PageContainer>
    </div>
  );
}
