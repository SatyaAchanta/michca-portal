import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { AccountForm } from "@/components/account/account-form";
import { prisma } from "@/lib/prisma";

const Account = async () => {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  let profile;
  let umpiringResult = null;

  try {
    profile = await prisma.userProfile.findUnique({
      where: { clerkUserId: userId },
      select: {
        id: true,
        clerkUserId: true,
        email: true,
        firstName: true,
        lastName: true,
        notificationsEnabled: true,
        newsletterSubscribed: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (profile) {
      const registration = await prisma.umpiringTraining.findUnique({
        where: { userProfileId: profile.id },
        select: { result: true },
      });

      umpiringResult = registration?.result ?? null;
    }
  } catch (error) {
    console.log("Error fetching user profile:", error);
    redirect("/sign-in");
  }

  return (
    <div className="m-2 md:m-16 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Account</h1>
      <AccountForm profile={profile ?? null} umpiringResult={umpiringResult} />
    </div>
  );
};

export default Account;
