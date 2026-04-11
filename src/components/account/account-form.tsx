"use client";

import { useActionState, useState, useTransition } from "react";

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

function UmpiringExamStatus({ result }: { result: UmpiringTrainingResult | null }) {
  if (!result) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Umpiring Exam Result</CardTitle>
          <CardDescription>
            No result available. You have not registered for the exam.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Umpiring Exam Result</CardTitle>
        <CardDescription>{getUmpiringResultDescription(result)}</CardDescription>
      </CardHeader>
      <CardContent>
        <Badge variant="outline" className={resultBadgeClass(result)}>
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
