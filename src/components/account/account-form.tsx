"use client";

import { useActionState, useState, useTransition } from "react";
import { AlertCircle, CircleEllipsis, RotateCcw, Trophy } from "lucide-react";

import { deleteAccount, updateProfile } from "@/app/account/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { UserProfile } from "@/generated/prisma/client";
import type { UpdateProfileState } from "@/app/account/actions";
import type { UmpiringTrainingResult } from "@/generated/prisma/client";
import {
  getUmpiringResultDescription,
  formatResultLabel,
  resultBadgeClass,
} from "@/components/umpiring-training/admin-formatters";

const INITIAL_UPDATE_STATE: UpdateProfileState = { status: "idle" };

type AccountFormProps = {
  profile: UserProfile | null;
  umpiringResult: UmpiringTrainingResult | null;
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

function UmpiringExamStatus({ result }: { result: UmpiringTrainingResult | null }) {
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

  const { Icon, accentClass, iconClass, eyebrow } = getResultPresentation(result);

  return (
    <Card className={`overflow-hidden border shadow-sm ${accentClass}`}>
      <CardHeader className="relative space-y-4 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {eyebrow}
            </p>
            <CardTitle className="text-2xl tracking-tight">Umpiring Exam Result</CardTitle>
          </div>
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${iconClass}`}
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <CardDescription>{getUmpiringResultDescription(result)}</CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-between gap-4 pt-0">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Status</p>
          <p className="text-lg font-semibold text-foreground">{formatResultLabel(result)}</p>
        </div>
        <Badge variant="outline" className={`px-3 py-1 text-sm ${resultBadgeClass(result)}`}>
          {formatResultLabel(result)}
        </Badge>
      </CardContent>
    </Card>
  );
}

export function AccountForm({ profile, umpiringResult }: AccountFormProps) {
  const [updateState, updateFormAction, isUpdatePending] = useActionState<
    UpdateProfileState,
    FormData
  >(updateProfile, INITIAL_UPDATE_STATE);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeletePending, startDeleteTransition] = useTransition();

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
    <div className="space-y-10">
      <UmpiringExamStatus result={umpiringResult} />

      {/* Profile section */}
      <section>
        <h2 className="text-xl font-semibold mb-1">Profile</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Update your display name shown across the portal.
        </p>
        <form action={updateFormAction} className="space-y-4 max-w-md">
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

          {updateState.status === "success" && updateState.message && (
            <p className="text-sm text-green-600 dark:text-green-400">
              {updateState.message}
            </p>
          )}
          {updateState.status === "error" && updateState.message && (
            <p className="text-sm text-destructive">{updateState.message}</p>
          )}

          <Button type="submit" disabled={isUpdatePending}>
            {isUpdatePending ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </section>

      {/* Danger zone */}
      <section className="border border-destructive/40 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-destructive mb-1">
          Danger Zone
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Permanently deletes your account and all associated data —
          registrations, umpiring assignments, and certification history. This
          cannot be undone.
        </p>
        {deleteError && (
          <p className="text-sm text-destructive mb-4">{deleteError}</p>
        )}
        <Button
          variant="destructive"
          disabled={isDeletePending}
          onClick={() => setIsDeleteDialogOpen(true)}
        >
          {isDeletePending ? "Deleting..." : "Delete Account"}
        </Button>
      </section>

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
