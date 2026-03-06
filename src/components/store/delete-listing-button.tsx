"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type DeleteListingButtonProps = {
  listingId: string;
  deleteAction: (listingId: string) => Promise<{ success: boolean; message: string }>;
};

export function DeleteListingButton({ listingId, deleteAction }: DeleteListingButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button type="button" variant="destructive" size="sm" className="w-full">
            Delete
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md p-0">
          <DialogHeader className="space-y-2 border-b border-border/70 pb-4">
            <DialogTitle>Delete This Listing?</DialogTitle>
            <DialogDescription>
              This permanently deletes the listing and all uploaded photos. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-end gap-2 p-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={pending}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={pending}
              onClick={() => {
                startTransition(async () => {
                  const result = await deleteAction(listingId);
                  setMessage(result.message);
                  if (result.success) {
                    setOpen(false);
                    router.refresh();
                  }
                });
              }}
            >
              {pending ? "Deleting..." : "Delete Permanently"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {message ? <p className="text-xs text-muted-foreground">{message}</p> : null}
    </div>
  );
}
