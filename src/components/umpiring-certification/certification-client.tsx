"use client";

import { useMemo, useState, useTransition, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AlertTriangle, CheckCircle2, Clock3, Expand, Flag, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { autoSubmitIfExpired, saveAttemptAnswer, submitMyCertificationAttempt, toggleAttemptFlag } from "@/app/umpiring-certification/actions";

type AttemptOption = {
  id: string;
  label: string;
};

type AttemptQuestion = {
  id: string;
  displayOrder: number;
  promptSnapshot: string;
  imageUrl?: string | null;
  selectedOptionIdOriginal: string | null;
  isFlagged: boolean;
  options: AttemptOption[];
};

type CertificationClientProps = {
  expiresAtIso: string;
  questions: AttemptQuestion[];
};

function formatRemaining(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function CertificationClient({ expiresAtIso, questions }: CertificationClientProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFinishOpen, setIsFinishOpen] = useState(false);
  const [isImageOpen, setIsImageOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [timeRemaining, setTimeRemaining] = useState(() => new Date(expiresAtIso).getTime() - Date.now());
  const hasExpiredSubmissionStarted = useRef(false);

  const currentQuestion = questions[currentIndex];
  const answeredCount = useMemo(
    () => questions.filter((item) => item.selectedOptionIdOriginal !== null).length,
    [questions]
  );
  const flaggedCount = useMemo(() => questions.filter((item) => item.isFlagged).length, [questions]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTimeRemaining(new Date(expiresAtIso).getTime() - Date.now());
    }, 1000);
    return () => clearInterval(intervalId);
  }, [expiresAtIso]);

  useEffect(() => {
    if (timeRemaining > 0 || hasExpiredSubmissionStarted.current) {
      return;
    }
    hasExpiredSubmissionStarted.current = true;
    startTransition(async () => {
      await autoSubmitIfExpired();
      router.refresh();
    });
  }, [router, timeRemaining]);

  const saveSelection = (optionId: string) => {
    startTransition(async () => {
      await saveAttemptAnswer(currentQuestion.id, optionId);
      router.refresh();
    });
  };

  const toggleFlag = () => {
    startTransition(async () => {
      await toggleAttemptFlag(currentQuestion.id, !currentQuestion.isFlagged);
      router.refresh();
    });
  };

  const submitAttempt = () => {
    startTransition(async () => {
      await submitMyCertificationAttempt(false);
      setIsFinishOpen(false);
      router.refresh();
    });
  };

  return (
    <div className="space-y-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <Card className="sticky top-16 z-20 border-red-500/20 bg-red-500/5 p-3 sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Clock3 className="h-4 w-4 text-red-600" />
            <p className="text-sm font-semibold text-red-700 dark:text-red-300">
              Time Remaining: {formatRemaining(timeRemaining)}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
            <Badge variant="outline">Answered {answeredCount}/{questions.length}</Badge>
            <Badge variant="outline">Flagged {flaggedCount}</Badge>
          </div>
        </div>
      </Card>

      <Card className="space-y-4 p-4 sm:p-6">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground">Question {currentQuestion.displayOrder} of {questions.length}</p>
          <Button
            type="button"
            variant={currentQuestion.isFlagged ? "default" : "outline"}
            className="min-h-11"
            onClick={toggleFlag}
            disabled={isPending}
          >
            <Flag className="mr-2 h-4 w-4" />
            {currentQuestion.isFlagged ? "Flagged" : "Flag"}
          </Button>
        </div>

        <p className="text-base font-medium leading-7 sm:text-lg">{currentQuestion.promptSnapshot}</p>

        {currentQuestion.imageUrl ? (
          <>
            <button
              type="button"
              className="group relative block overflow-hidden rounded-lg border bg-muted/20"
              onClick={() => setIsImageOpen(true)}
            >
              <div className="relative h-[260px] w-full sm:h-[420px]">
                <Image
                  src={currentQuestion.imageUrl}
                  alt={`Question ${currentQuestion.displayOrder}`}
                  fill
                  sizes="(max-width: 640px) 100vw, 80vw"
                  className="object-contain"
                />
              </div>
              <div className="absolute right-3 top-3 rounded-full bg-background/90 p-2 text-foreground shadow-sm">
                <Expand className="h-4 w-4" />
              </div>
            </button>
            <p className="text-xs text-muted-foreground">
              Tap the image to enlarge it.
            </p>
            <Dialog open={isImageOpen} onOpenChange={setIsImageOpen}>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Question Image</DialogTitle>
                </DialogHeader>
                <div className="p-4 pt-0">
                  <div className="relative h-[70vh] w-full">
                    <Image
                      src={currentQuestion.imageUrl}
                      alt={`Question ${currentQuestion.displayOrder}`}
                      fill
                      sizes="100vw"
                      className="rounded-md object-contain"
                    />
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </>
        ) : null}

        <div className="grid gap-2">
          {currentQuestion.options.map((option) => {
            const selected = currentQuestion.selectedOptionIdOriginal === option.id;
            return (
              <Button
                key={option.id}
                type="button"
                variant={selected ? "default" : "outline"}
                className="min-h-11 justify-start whitespace-normal text-left"
                onClick={() => saveSelection(option.id)}
                disabled={isPending}
              >
                {selected ? <CheckCircle2 className="mr-2 h-4 w-4" /> : null}
                {option.label}
              </Button>
            );
          })}
        </div>
      </Card>

      <Card className="p-4">
        <p className="mb-3 text-sm font-medium">Quick Navigation</p>
        <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
          {questions.map((question, idx) => (
            <Button
              key={question.id}
              type="button"
              variant={idx === currentIndex ? "default" : "outline"}
              className="min-h-11 px-0"
              onClick={() => setCurrentIndex(idx)}
            >
              {question.displayOrder}
              {question.isFlagged ? "*" : ""}
            </Button>
          ))}
        </div>
      </Card>

      <div className="sticky bottom-0 grid grid-cols-3 gap-2 rounded-lg border bg-background/95 p-2 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <Button
          type="button"
          variant="outline"
          className="min-h-11"
          onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
          disabled={currentIndex === 0 || isPending}
        >
          Previous
        </Button>
        <Dialog open={isFinishOpen} onOpenChange={setIsFinishOpen}>
          <DialogTrigger asChild>
            <Button type="button" className="min-h-11 bg-red-600 hover:bg-red-700" disabled={isPending}>
              Finish Test
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Finish this test?</DialogTitle>
              <DialogDescription>
                You answered {answeredCount} out of {questions.length} questions. You cannot restart after submission.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-wrap justify-end gap-2 p-4 pt-0">
              <Button type="button" variant="outline" onClick={() => setIsFinishOpen(false)}>Cancel</Button>
              <Button type="button" className="bg-red-600 hover:bg-red-700" onClick={submitAttempt}>
                Yes, Finish
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        <Button
          type="button"
          variant="outline"
          className="min-h-11"
          onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
          disabled={currentIndex === questions.length - 1 || isPending}
        >
          Next
        </Button>
      </div>

      {isPending ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Saving progress...
        </div>
      ) : null}
      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        <AlertTriangle className="h-4 w-4" />
        Your answers are saved as you select them.
      </p>
    </div>
  );
}
