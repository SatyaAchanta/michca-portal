import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

import { WaiverForm } from "@/components/waiver/waiver-form";
import type { SecondaryDivisionValue } from "@/components/waiver/validation";
import { Card } from "@/components/ui/card";
import { PageContainer } from "@/components/page-container";
import { prisma } from "@/lib/prisma";
import { getWaiverTeamOptions } from "@/lib/team-queries";
import {
  AuthenticationRequiredError,
  getOrCreateCurrentUserProfile,
} from "@/lib/user-profile";
import { getCurrentWaiverYear } from "@/lib/waiver-constants";

const waiverContent = (
  <div className="space-y-4 text-sm leading-7 text-muted-foreground sm:text-base">
    <p className="font-semibold uppercase tracking-[0.18em] text-foreground">
      This is an important legal document. Please read carefully before signing.
    </p>
    <p>
      In consideration of my acceptance into the Mich-CA 2026 League, I, on
      behalf of myself and my heirs, executors, administrators, trustees, and
      successors in interest, hereby fully and forever waive, release, and
      discharge any and all rights, claims, demands, causes of action, or
      liabilities of any kind, including but not limited to claims arising from
      negligence, premises liability, emotional distress, personal injury,
      property damage, or any other tort or statutory claim, to the fullest
      extent permitted by law, against the Released Parties.
    </p>
    <ol className="list-decimal space-y-2 pl-5">
      <li>Mich-CA 2026 League</li>
      <li>
        Authorities related to the venues/grounds as published in the official
        schedule
      </li>
      <li>Michigan USA Track &amp; Field</li>
      <li>Mich-CA 2026 League organizers and committee members</li>
      <li>All sponsors of the Mich-CA 2026 League</li>
      <li>
        All employees, principals, directors, shareholders, agents, members,
        managers, affiliates, volunteers, officials, and representatives acting
        for or on behalf of any of the above entities
      </li>
    </ol>
    <p>
      I understand and acknowledge that participation in the Mich-CA 2026 League
      involves inherent risks, including the risk of serious injury or death. I
      voluntarily assume all such risks, known and unknown, associated with my
      participation.
    </p>
    <div>
      <h2 className="text-base font-semibold text-foreground">
        Medical Fitness Certification
      </h2>
      <p>
        I attest and verify that I am physically fit and sufficiently trained to
        participate in the Mich-CA 2026 League. I confirm that I have consulted
        with a medical professional regarding my physical condition and that I
        have no known medical conditions that would prevent safe participation.
      </p>
    </div>
    <div>
      <h2 className="text-base font-semibold text-foreground">
        Media and Likeness Release
      </h2>
      <p>
        As a condition of participation, I grant the Mich-CA 2026 League a
        limited, royalty-free license to use my name, image, likeness, voice,
        video recordings, athletic performance, and biographical information in
        any format for promotional, broadcast, or reporting purposes related to
        the event, the sport, or affiliated organizations.
      </p>
      <p>
        I also agree to maintain respectful conduct and will refrain from making
        public criticism or inappropriate comments, whether in person, through
        social media, or via any public platform, regarding any incident
        occurring during a Mich-CA match, or concerning any player, player
        support personnel, league official, match official, or team
        participating in a Mich-CA event, regardless of when such comments are
        made.
      </p>
    </div>
    <div>
      <h2 className="text-base font-semibold text-foreground">
        Safety Equipment Acknowledgment
      </h2>
      <p>
        I understand the significant risk of serious injury associated with not
        wearing protective equipment. I agree that I will always wear an
        approved helmet while batting against any medium-pace or fast bowler. I
        accept full responsibility for compliance with this safety requirement
        and acknowledge the risks involved in failing to do so.
      </p>
    </div>
    <p>
      The Mich-CA 2026 League reserves the right to reject any entry and to
      modify event details at its discretion without prior notice.
    </p>
  </div>
);

type WaiverPageSubmission = {
  playerName: string;
  cricclubsId: string;
  state: string | null;
  city: string;
  address: string | null;
  t20Division: string | null;
  t20TeamCode: string | null;
  secondaryDivision: SecondaryDivisionValue | null;
  secondaryTeamCode: string | null;
  isUnder18: boolean;
  parentName: string;
  signatureName: string;
  submittedAt: string;
};

export default async function WaiverPage() {
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

  const year = getCurrentWaiverYear();
  const [teams, waiver] = await Promise.all([
    getWaiverTeamOptions(),
    prisma.waiverSubmission.findUnique({
      where: {
        userProfileId_year: {
          userProfileId: profile.id,
          year,
        },
      },
      select: {
        playerName: true,
        cricclubsId: true,
        state: true,
        city: true,
        address: true,
        t20Division: true,
        t20TeamCode: true,
        secondaryDivision: true,
        secondaryTeamCode: true,
        isUnder18: true,
        parentName: true,
        signatureName: true,
        submittedAt: true,
      },
    }),
  ]);

  const t20Divisions = Array.from(
    new Set(
      teams
        .filter((team) => team.format === "T20")
        .map((team) => team.division),
    ),
  );
  const waiverSubmission: WaiverPageSubmission | null = waiver
    ? {
        playerName: waiver.playerName,
        cricclubsId: waiver.cricclubsId,
        state: waiver.state,
        city: waiver.city,
        address: waiver.address,
        t20Division: waiver.t20Division,
        t20TeamCode: waiver.t20TeamCode,
        secondaryDivision:
          waiver.secondaryDivision as SecondaryDivisionValue | null,
        secondaryTeamCode: waiver.secondaryTeamCode,
        isUnder18: waiver.isUnder18,
        parentName: waiver.parentName,
        signatureName: waiver.signatureName,
        submittedAt: waiver.submittedAt.toISOString(),
      }
    : null;

  return (
    <div className="bg-background py-12">
      <PageContainer className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Player Waiver Form
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
            Submit your Mich-CA {year} waiver. One waiver is stored per player
            per calendar year.
          </p>
        </div>

        <Card className="max-h-[24rem] overflow-y-auto p-5 sm:max-h-none sm:overflow-visible sm:p-6">
          {waiverContent}
        </Card>

        <WaiverForm
          waiver={waiverSubmission}
          t20Divisions={t20Divisions}
          teams={teams}
        />
      </PageContainer>
    </div>
  );
}
