"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Loader2, MapPin, PlayCircle, Square } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { startCertificationWindow, closeCertificationWindow } from "@/app/admin/certification-windows/actions";
import { UMPIRING_LOCATION_OPTIONS } from "@/components/umpiring-training/validation";

type WindowItem = {
  id: string;
  location: string;
  testDateLocal: string;
  status: string;
  questionCount: number;
  durationMinutes: number;
  startedAt: string;
  closedAt: string | null;
  startedByName: string;
};

export function AdminWindowManager({
  windows,
  defaultDate,
}: {
  windows: WindowItem[];
  defaultDate: string;
}) {
  const router = useRouter();
  const [location, setLocation] = useState<string>(UMPIRING_LOCATION_OPTIONS[0] ?? "");
  const [dateLocal, setDateLocal] = useState(defaultDate);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const startWindow = () => {
    startTransition(async () => {
      const result = await startCertificationWindow(location, dateLocal);
      setFeedback(result.message);
      router.refresh();
    });
  };

  return (
    <div className="space-y-4">
      <Card className="space-y-4 p-4 sm:p-6">
        <div className="flex items-center gap-2">
          <PlayCircle className="h-4 w-4" />
          <p className="font-medium">Start Certification Window</p>
        </div>
        <p className="text-sm font-medium text-red-600 dark:text-red-400">
          At least 20 active questions are required before you can start a test window.
        </p>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Location</p>
            <select
              className="h-11 w-full rounded-md border bg-background px-3 text-sm"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
            >
              {UMPIRING_LOCATION_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Date</p>
            <Input
              type="date"
              className="h-11 bg-background text-foreground [color-scheme:light] dark:[color-scheme:dark]"
              value={dateLocal}
              onChange={(event) => setDateLocal(event.target.value)}
            />
          </div>
          <div className="flex items-end">
            <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
              <DialogTrigger asChild>
                <Button type="button" className="min-h-11 w-full" disabled={isPending}>
                  {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Start Window
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Start certification window?</DialogTitle>
                  <DialogDescription>
                    This will activate the test for <strong>{location}</strong> on{" "}
                    <strong>{dateLocal}</strong>. Eligible players can start immediately.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex justify-end gap-2 p-4 pt-0">
                  <Button type="button" variant="outline" onClick={() => setIsConfirmOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      setIsConfirmOpen(false);
                      startWindow();
                    }}
                  >
                    Yes, Start
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        {feedback ? <p className="text-sm text-muted-foreground">{feedback}</p> : null}
      </Card>

      <div className="space-y-3">
        {windows.map((window) => (
          <Card key={window.id} className="space-y-3 p-4 sm:p-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={window.status === "ACTIVE" ? "default" : "outline"}>{window.status}</Badge>
              <Badge variant="outline">
                <MapPin className="mr-1 h-3 w-3" />
                {window.location}
              </Badge>
              <Badge variant="outline">
                <Calendar className="mr-1 h-3 w-3" />
                {window.testDateLocal}
              </Badge>
            </div>
            <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
              <p>Questions: {window.questionCount}</p>
              <p>Duration: {window.durationMinutes} min</p>
              <p>Started By: {window.startedByName}</p>
              <p>Started At: {window.startedAt}</p>
            </div>
            {window.status === "ACTIVE" ? (
              <Button
                type="button"
                variant="outline"
                className="min-h-11"
                onClick={() =>
                  startTransition(async () => {
                    const result = await closeCertificationWindow(window.id);
                    setFeedback(result.message);
                    router.refresh();
                  })
                }
                disabled={isPending}
              >
                <Square className="mr-2 h-4 w-4" />
                Close Window
              </Button>
            ) : null}
          </Card>
        ))}
      </div>
    </div>
  );
}
