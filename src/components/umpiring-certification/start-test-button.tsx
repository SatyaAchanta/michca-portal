"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { startMyCertificationAttempt } from "@/app/umpiring-certification/actions";

export function StartTestButton() {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const startTest = () => {
    startTransition(async () => {
      const result = await startMyCertificationAttempt();
      setMessage(result.message);
      router.refresh();
    });
  };

  return (
    <div className="space-y-2">
      <Button type="button" className="min-h-11" onClick={startTest} disabled={isPending}>
        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Start Test
      </Button>
      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
    </div>
  );
}
