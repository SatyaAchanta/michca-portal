import Link from "next/link";
import { FileSignature } from "lucide-react";
import { auth } from "@clerk/nextjs/server";

import { prisma } from "@/lib/prisma";
import { getCurrentWaiverYear } from "@/lib/waiver-constants";

export async function RegistrationBanner() {
  const { userId } = await auth();

  if (userId) {
    const profile = await prisma.userProfile.findUnique({
      where: { clerkUserId: userId },
      select: { id: true },
    });

    if (profile) {
      const existingWaiver = await prisma.waiverSubmission.findUnique({
        where: {
          userProfileId_year: {
            userProfileId: profile.id,
            year: getCurrentWaiverYear(),
          },
        },
        select: { id: true },
      });

      if (existingWaiver) {
        return null;
      }
    }
  }

  return (
    <div className="rounded-lg border border-border/70 bg-card/80 px-4 py-3 shadow-sm">
      <p className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-center sm:text-center">
        <span className="inline-flex items-center gap-2 font-medium text-foreground">
          <FileSignature className="h-4 w-4 text-primary" />
          2026 player waiver
        </span>
        <span className="hidden text-border sm:inline" aria-hidden="true">
          |
        </span>
        <span>
          Required before match play.{" "}
          <Link
            href="/waiver"
            className="font-medium text-foreground underline underline-offset-4"
          >
            Complete the waiver form
          </Link>
          .
        </span>
      </p>
    </div>
  );
}
