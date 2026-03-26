import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

import { PageContainer } from "@/components/page-container";
import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Youth15RegistrationForm } from "@/components/y15-registration/registration-form";
import { prisma } from "@/lib/prisma";
import { AuthenticationRequiredError, getOrCreateCurrentUserProfile } from "@/lib/user-profile";

const descriptionContent = (
    <div className="space-y-4 text-sm leading-7 text-muted-foreground sm:text-base">
    <p>Note: This form should be filled by the Club President or Secretary.</p>
    <p>
      Registration payments can be made via Zelle or Chase Quick Pay to
      {" "}
      <span className="font-medium text-foreground">micricketfinance@gmail.com</span>.
    </p>
    <div className="grid gap-3 sm:grid-cols-2">
      <Card className="border-primary/35 bg-primary/10 p-4 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">League details</p>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          <li>Age Group: U15</li>
          <li>Players between 10-15 years old</li>
          <li>Cutoff date: 09/01/2011</li>
          <li>Registration fee: $1200 per team</li>
          <li>Initial deposit: $500 due by 03/31/2026</li>
          <li>Full fee due by 04/12/2026</li>
        </ul>
      </Card>
      <Card className="border-primary/35 bg-primary/10 p-4 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Season format</p>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          <li>League starts: August 1st</li>
          <li>Minimum teams required: 3</li>
          <li>Minimum games guaranteed: 6 per team</li>
          <li>Game days: Saturdays and/or weekdays</li>
          <li>Match format: 20 overs per innings</li>
        </ul>
      </Card>
    </div>
  </div>
);

export default async function Youth15RegistrationPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  let profile;
  try {
    profile = await getOrCreateCurrentUserProfile();
  } catch (error) {
    if (error instanceof AuthenticationRequiredError) {
      redirect("/sign-in");
    }
    throw error;
  }

  const registration = await prisma.youth15Registration.findUnique({
    where: { userProfileId: profile.id },
    select: {
      clubName: true,
      presidentName: true,
      presidentEmail: true,
      presidentPhoneNumber: true,
      secretaryName: true,
      secretaryEmail: true,
      secretaryPhoneNumber: true,
    },
  });

  return (
    <div className="bg-background py-12">
      <PageContainer className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Youth 15 Registration
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
            Register your club for the 2026 Youth 15 league. You can update your submission any
            time.
          </p>
        </div>

        <div className="hidden md:block">{descriptionContent}</div>
        <div className="md:hidden">
          <Accordion type="single" collapsible className="rounded-lg border border-border/70 px-4">
            <AccordionItem value="y15-details" className="border-b-0">
              <AccordionTrigger className="text-left hover:no-underline">
                Registration details
              </AccordionTrigger>
              <AccordionContent>{descriptionContent}</AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <Youth15RegistrationForm registration={registration} />
      </PageContainer>
    </div>
  );
}
