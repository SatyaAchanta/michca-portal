"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";

type MarkSoldButtonProps = {
  listingId: string;
  markSoldAction: (listingId: string) => Promise<{ success: boolean; message: string }>;
};

export function MarkSoldButton({ listingId, markSoldAction }: MarkSoldButtonProps) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        className="w-full"
        disabled={pending}
        onClick={() => {
          startTransition(async () => {
            const result = await markSoldAction(listingId);
            setMessage(result.message);
          });
        }}
      >
        {pending ? "Updating..." : "Mark Sold"}
      </Button>
      {message ? <p className="text-xs text-muted-foreground">{message}</p> : null}
    </div>
  );
}
