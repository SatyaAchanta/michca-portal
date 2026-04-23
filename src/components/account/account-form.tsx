"use client";

import Link from "next/link";
import { useActionState, useState, useTransition } from "react";
import {
  AlertCircle,
  CircleEllipsis,
  FileSignature,
  RotateCcw,
  Trophy,
} from "lucide-react";

import { deleteAccount, updateProfile } from "@/app/account/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { UserProfile } from "@/generated/prisma/client";
import type { UpdateProfileState } from "@/app/account/actions";
import type { UmpiringTrainingResult } from "@/generated/prisma/client";
import {
  getUmpiringResultDescription,
  formatResultLabel,
  resultBadgeClass,
} from "@/components/umpiring-training/admin-formatters";
import { WAIVER_ROLE_OPTIONS } from "@/lib/waiver-constants";

const INITIAL_UPDATE_STATE: UpdateProfileState = { status: "idle" };

type TeamOption = {
  teamCode: string;
  teamName: string;
  division: string;
  format: string;
};

type AccountFormProps = {
  profile: UserProfile | null;
  umpiringResult: UmpiringTrainingResult | null;
  teams: TeamOption[];
  captainedTeams?: TeamOption[];
  waiverSubmission: {
    submittedAt: string;
    state: string | null;
    city: string;
    address: string | null;
    t20Division: string | null;
    secondaryDivision: string | null;
    t20TeamCode: string | null;
    secondaryTeamCode: string | null;
    isUnder18: boolean;
    parentName: string;
  } | null;
};

function getResultPresentation(result: UmpiringTrainingResult) {
  if (result === "PASS") {
    return {
      Icon: Trophy,
      accentClass:
        "border-green-500/25 bg-[linear-gradient(135deg,rgba(34,197,94,0.12),rgba(255,255,255,0.92))] dark:bg-[linear-gradient(135deg,rgba(34,197,94,0.18),rgba(10,10,10,0.94))]",
      iconClass:
        "border-green-500/20 bg-green-500/12 text-green-700 dark:text-green-300",
      eyebrow: "Certification complete",
    };
  }

  if (result === "FAIL") {
    return {
      Icon: AlertCircle,
      accentClass:
        "border-red-500/25 bg-[linear-gradient(135deg,rgba(239,68,68,0.10),rgba(255,255,255,0.92))] dark:bg-[linear-gradient(135deg,rgba(239,68,68,0.14),rgba(10,10,10,0.94))]",
      iconClass:
        "border-red-500/20 bg-red-500/12 text-red-700 dark:text-red-300",
      eyebrow: "Certification update",
    };
  }

  if (result === "REAPPEAR") {
    return {
      Icon: RotateCcw,
      accentClass:
        "border-sky-500/25 bg-[linear-gradient(135deg,rgba(14,165,233,0.10),rgba(255,255,255,0.92))] dark:bg-[linear-gradient(135deg,rgba(14,165,233,0.16),rgba(10,10,10,0.94))]",
      iconClass:
        "border-sky-500/20 bg-sky-500/12 text-sky-700 dark:text-sky-300",
      eyebrow: "Retake required",
    };
  }

  return {
    Icon: CircleEllipsis,
    accentClass:
      "border-amber-500/25 bg-[linear-gradient(135deg,rgba(245,158,11,0.10),rgba(255,255,255,0.92))] dark:bg-[linear-gradient(135deg,rgba(245,158,11,0.16),rgba(10,10,10,0.94))]",
    iconClass:
      "border-amber-500/20 bg-amber-500/12 text-amber-700 dark:text-amber-300",
    eyebrow: "Result in review",
  };
}

function getUmpiringMobileSummary(result: UmpiringTrainingResult | null) {
  if (!result) {
    return "No umpiring result yet.";
  }

  return `Umpiring result: ${formatResultLabel(result)}.`;
}

function getWaiverMobileSummary(
  waiverSubmission: AccountFormProps["waiverSubmission"]
) {
  if (!waiverSubmission) {
    return "Waiver not submitted yet.";
  }

  return `Waiver submitted on ${new Date(waiverSubmission.submittedAt).toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  )}.`;
}

function getMobileUmpiringSummaryClass(result: UmpiringTrainingResult | null) {
  if (result === "PASS") {
    return "border-green-500/25 bg-green-500/8";
  }
  if (result === "FAIL") {
    return "border-red-500/25 bg-red-500/8";
  }
  if (result === "REAPPEAR") {
    return "border-sky-500/25 bg-sky-500/8";
  }
  if (result === "PENDING") {
    return "border-amber-500/25 bg-amber-500/8";
  }

  return "border-border/70 bg-card/80";
}

function getMobileWaiverSummaryClass(
  waiverSubmission: AccountFormProps["waiverSubmission"]
) {
  if (waiverSubmission) {
    return "border-sky-500/25 bg-sky-500/8";
  }

  return "border-amber-500/25 bg-amber-500/8";
}

function UmpiringExamStatus({
  result,
}: {
  result: UmpiringTrainingResult | null;
}) {
  if (!result) {
    return (
      <Card className="border border-border/70 bg-card/80 shadow-sm">
        <CardHeader className="space-y-2">
          <CardTitle>Umpiring Exam Result</CardTitle>
          <CardDescription>
            No result available. You have not registered for the exam.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const { Icon, accentClass, iconClass, eyebrow } =
    getResultPresentation(result);

  return (
    <Card className={`overflow-hidden border shadow-sm ${accentClass}`}>
      <CardHeader className="relative space-y-4 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {eyebrow}
            </p>
            <CardTitle className="text-2xl tracking-tight">
              Umpiring Exam Result
            </CardTitle>
          </div>
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${iconClass}`}
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <CardDescription>
          {getUmpiringResultDescription(result)}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-between gap-4 pt-0">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Status</p>
          <p className="text-lg font-semibold text-foreground">
            {formatResultLabel(result)}
          </p>
        </div>
        <Badge
          variant="outline"
          className={`px-3 py-1 text-sm ${resultBadgeClass(result)}`}
        >
          {formatResultLabel(result)}
        </Badge>
      </CardContent>
    </Card>
  );
}

function MobileStatusSummary({
  umpiringResult,
  waiverSubmission,
}: {
  umpiringResult: UmpiringTrainingResult | null;
  waiverSubmission: AccountFormProps["waiverSubmission"];
}) {
  return (
    <div className="space-y-3 lg:hidden">
      <div
        className={`rounded-xl border px-4 py-3 text-sm ${getMobileUmpiringSummaryClass(
          umpiringResult
        )}`}
      >
        <p className="font-medium text-foreground">Umpiring</p>
        <p className="text-muted-foreground">
          {getUmpiringMobileSummary(umpiringResult)}
        </p>
      </div>
      <div
        className={`rounded-xl border px-4 py-3 text-sm ${getMobileWaiverSummaryClass(
          waiverSubmission
        )}`}
      >
        <p className="font-medium text-foreground">Waiver</p>
        <p className="text-muted-foreground">
          {getWaiverMobileSummary(waiverSubmission)}
        </p>
      </div>
    </div>
  );
}

function WaiverStatus({
  waiverSubmission,
}: {
  waiverSubmission: AccountFormProps["waiverSubmission"];
}) {
  if (!waiverSubmission) {
    return (
      <Card className="border border-border/70 bg-card/80 shadow-sm">
        <CardHeader className="space-y-2">
          <CardTitle>Waiver Status</CardTitle>
          <CardDescription>
            You have not submitted the current year waiver yet.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/waiver">Go To Waiver Form</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border border-sky-500/25 bg-[linear-gradient(135deg,rgba(14,165,233,0.08),rgba(255,255,255,0.94))] shadow-sm dark:bg-[linear-gradient(135deg,rgba(14,165,233,0.14),rgba(10,10,10,0.94))]">
      <CardHeader className="relative space-y-4 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Current year waiver
            </p>
            <CardTitle className="text-2xl tracking-tight">
              Waiver Submitted
            </CardTitle>
          </div>
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-sky-500/20 bg-sky-500/12 text-sky-700 dark:text-sky-300">
            <FileSignature className="h-5 w-5" />
          </div>
        </div>
        <CardDescription>
          Submitted on{" "}
          {new Date(waiverSubmission.submittedAt).toLocaleString("en-US")}.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 pt-0 text-sm text-muted-foreground">
        <p>
          State:{" "}
          <span className="font-medium text-foreground">
            {waiverSubmission.state ?? "-"}
          </span>
        </p>
        <p>
          City:{" "}
          <span className="font-medium text-foreground">
            {waiverSubmission.city}
          </span>
        </p>
        <p>
          Address:{" "}
          <span className="font-medium text-foreground">
            {waiverSubmission.address ?? "-"}
          </span>
        </p>
        <p>
          T20:{" "}
          <span className="font-medium text-foreground">
            {waiverSubmission.t20Division
              ? `${waiverSubmission.t20Division} (${waiverSubmission.t20TeamCode})`
              : "N/A"}
          </span>
        </p>
        <p>
          Secondary:{" "}
          <span className="font-medium text-foreground">
            {waiverSubmission.secondaryDivision
              ? `${waiverSubmission.secondaryDivision} (${waiverSubmission.secondaryTeamCode})`
              : "N/A"}
          </span>
        </p>
        <p>
          Under 18:{" "}
          <span className="font-medium text-foreground">
            {waiverSubmission.isUnder18 ? "Yes" : "No"}
          </span>
        </p>
        {waiverSubmission.isUnder18 ? (
          <p>
            Parent&apos;s name:{" "}
            <span className="font-medium text-foreground">
              {waiverSubmission.parentName}
            </span>
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function AccountForm({
  profile,
  umpiringResult,
  teams,
  captainedTeams = [],
  waiverSubmission,
}: AccountFormProps) {
  const [updateState, updateFormAction, isUpdatePending] = useActionState<
    UpdateProfileState,
    FormData
  >(updateProfile, INITIAL_UPDATE_STATE);
  const [t20TeamCode, setT20TeamCode] = useState(profile?.t20TeamCode ?? "");
  const [secondaryTeamCode, setSecondaryTeamCode] = useState(
    profile?.secondaryTeamCode ?? ""
  );
  const [playingRole, setPlayingRole] = useState(profile?.playingRole ?? "");

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeletePending, startDeleteTransition] = useTransition();
  const t20Teams = teams.filter((team) => team.format === "T20");
  const secondaryTeams = teams.filter(
    (team) => team.format === "F40" || team.format === "T30"
  );

  const handleDeleteConfirm = () => {
    setIsDeleteDialogOpen(false);
    setDeleteError(null);
    startDeleteTransition(async () => {
      const result = await deleteAccount();
      if (result?.status === "error") {
        setDeleteError(result.message);
      }
    });
  };

  return (
    <div className="space-y-8">
      <MobileStatusSummary
        umpiringResult={umpiringResult}
        waiverSubmission={waiverSubmission}
      />

      <div className="space-y-8 lg:grid lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.9fr)] lg:gap-12 lg:space-y-0 xl:gap-16">
        <div className="min-w-0 space-y-8">
          {/* Profile section */}
          <section>
            <h2 className="mb-1 text-xl font-semibold">Profile</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Update your display name and current player information shown across the portal.
            </p>
            <form action={updateFormAction} className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="firstName" className="text-sm font-medium">
                  First Name
                </label>
                <Input
                  id="firstName"
                  name="firstName"
                  defaultValue={profile?.firstName ?? ""}
                  placeholder="First name"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="lastName" className="text-sm font-medium">
                  Last Name
                </label>
                <Input
                  id="lastName"
                  name="lastName"
                  defaultValue={profile?.lastName ?? ""}
                  placeholder="Last name"
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-medium">Current T20 Team</label>
                <input type="hidden" name="t20TeamCode" value={t20TeamCode} />
                <Select value={t20TeamCode} onValueChange={setT20TeamCode}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select current T20 team" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">N/A</SelectItem>
                    {t20Teams.map((team) => (
                      <SelectItem key={team.teamCode} value={team.teamCode}>
                        {team.teamName} ({team.division})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-medium">Current F40/T30 Team</label>
                <input
                  type="hidden"
                  name="secondaryTeamCode"
                  value={secondaryTeamCode}
                />
                <Select
                  value={secondaryTeamCode}
                  onValueChange={setSecondaryTeamCode}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select current F40/T30 team" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">N/A</SelectItem>
                    {secondaryTeams.map((team) => (
                      <SelectItem key={team.teamCode} value={team.teamCode}>
                        {team.teamName} ({team.format})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-medium">Playing Role</label>
                <input type="hidden" name="playingRole" value={playingRole} />
                <Select value={playingRole} onValueChange={setPlayingRole}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select playing role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">N/A</SelectItem>
                    {WAIVER_ROLE_OPTIONS.map((roleOption) => (
                      <SelectItem key={roleOption} value={roleOption}>
                        {roleOption}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {updateState.status === "success" && updateState.message && (
                <p className="text-sm text-green-600 dark:text-green-400 md:col-span-2">
                  {updateState.message}
                </p>
              )}
              {updateState.status === "error" && updateState.message && (
                <p className="text-sm text-destructive md:col-span-2">{updateState.message}</p>
              )}

              <Button type="submit" disabled={isUpdatePending} className="md:col-span-2 md:w-fit">
                {isUpdatePending ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </section>

          <section>
            <h2 className="mb-1 text-xl font-semibold">Captain Status</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Teams where you are currently listed as captain through the Club Info declaration.
            </p>
            {captainedTeams.length > 0 ? (
              <Card className="border border-sky-500/25 bg-sky-500/8 shadow-sm">
                <CardContent className="space-y-4 p-6">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="border-sky-500/30 text-sky-700 dark:text-sky-300">
                      Captain
                    </Badge>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    {captainedTeams.map((team) => (
                      <div key={team.teamCode} className="rounded-xl border border-border/70 p-4">
                        <p className="font-medium text-foreground">{team.teamName}</p>
                        <p className="text-sm text-muted-foreground">
                          {team.format} · {team.division}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border border-border/70 bg-card/80 shadow-sm">
                <CardHeader className="space-y-2">
                  <CardTitle>No Captain Teams Yet</CardTitle>
                  <CardDescription>
                    Submit the Club Info form to connect your captain profile to your team pages.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild>
                    <Link href="/club-info">Go To Club Info Form</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </section>

          {/* Danger zone */}
          <section className="rounded-lg border border-destructive/40 p-6">
            <h2 className="mb-1 text-xl font-semibold text-destructive">
              Danger Zone
            </h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Permanently deletes your account and all associated data —
              registrations, umpiring assignments, and certification history. This
              cannot be undone.
            </p>
            {deleteError && (
              <p className="mb-4 text-sm text-destructive">{deleteError}</p>
            )}
            <Button
              variant="destructive"
              disabled={isDeletePending}
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              {isDeletePending ? "Deleting..." : "Delete Account"}
            </Button>
          </section>
        </div>

        <aside className="hidden min-w-0 space-y-6 lg:block">
          <UmpiringExamStatus result={umpiringResult} />
          <WaiverStatus waiverSubmission={waiverSubmission} />
        </aside>
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete your account? All your
              data will be removed, including registrations, umpiring
              assignments, and certification history. This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Yes, delete my account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
