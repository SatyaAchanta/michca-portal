"use client";

import { useEffect, useState } from "react";
import { LoaderCircle, Sparkles } from "lucide-react";
import { track } from "@vercel/analytics/react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { FantasyAnalysisResponse } from "@/lib/fantasy-analysis";

type LoadState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "loaded"; data: FantasyAnalysisResponse }
  | { kind: "failed"; message: string };

function formatPercent(value: number | null) {
  if (value === null) return "—";
  return `${Math.round(value * 100)}%`;
}

function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function AiAnalysisDialog() {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<LoadState>({ kind: "idle" });

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen && !open) {
      track("fantasy_ai_analysis_opened", {
        surface: "fantasy_page",
      });
    }

    setOpen(nextOpen);
  }

  async function loadReport() {
    setState({ kind: "loading" });

    try {
      const response = await fetch("/api/fantasy/analysis", {
        method: "GET",
        cache: "no-store",
      });
      const payload = (await response.json()) as FantasyAnalysisResponse;

      if (!response.ok && payload.status !== "error") {
        throw new Error("Unexpected AI Analysis response.");
      }

      setState({ kind: "loaded", data: payload });
    } catch (error) {
      console.error("Failed to load AI Analysis:", error);
      setState({
        kind: "failed",
        message: "AI Analysis is unavailable right now. Please try again shortly.",
      });
    }
  }

  useEffect(() => {
    if (open && state.kind === "idle") {
      void loadReport();
    }
  }, [open, state.kind]);

  const content =
    state.kind === "loading" || state.kind === "idle" ? (
      <div className="flex min-h-72 flex-col items-center justify-center gap-3 px-6 py-10 text-center">
        <LoaderCircle className="h-6 w-6 animate-spin text-primary" />
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">Building your AI Analysis</p>
          <p className="text-sm text-muted-foreground">
            Comparing your scored predictions against the field.
          </p>
        </div>
      </div>
    ) : state.kind === "failed" ? (
      <div className="space-y-4 px-6 py-6">
        <p className="text-sm text-muted-foreground">{state.message}</p>
        <Button type="button" onClick={() => void loadReport()}>
          Retry
        </Button>
      </div>
    ) : state.data.status === "error" ? (
      <div className="space-y-4 px-6 py-6">
        <p className="text-sm text-muted-foreground">{state.data.message}</p>
        <Button type="button" onClick={() => void loadReport()}>
          Retry
        </Button>
      </div>
    ) : state.data.status === "insufficient_data" ? (
      <div className="space-y-3 px-6 py-6">
        <div className="rounded-xl border border-dashed border-border bg-muted/30 p-4">
          <p className="text-sm font-medium text-foreground">More scored picks needed</p>
          <p className="mt-1 text-sm text-muted-foreground">{state.data.message}</p>
        </div>
      </div>
    ) : (
      <div className="space-y-5 px-6 py-6">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Accuracy
            </p>
            <p className="mt-1 text-2xl font-semibold text-foreground">
              {formatPercent(state.data.metrics.season.accuracy)}
            </p>
          </div>
          <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Percentile
            </p>
            <p className="mt-1 text-2xl font-semibold text-foreground">
              {state.data.metrics.season.percentile === null
                ? "—"
                : `${state.data.metrics.season.percentile}th`}
            </p>
          </div>
          <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Boosted Pick Hit Rate
            </p>
            <p className="mt-1 text-2xl font-semibold text-foreground">
              {formatPercent(state.data.metrics.boosters.accuracy)}
            </p>
          </div>
        </div>

        <section className="space-y-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Summary
          </h3>
          <p className="text-sm leading-6 text-foreground">{state.data.report.summary}</p>
        </section>

        <div className="grid gap-4 md:grid-cols-2">
          <section className="space-y-2">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Strengths
            </h3>
            <ul className="space-y-2 text-sm text-foreground">
              {state.data.report.strengths.map((item) => (
                <li key={item} className="rounded-xl border border-border/70 bg-muted/20 px-3 py-2">
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Weaknesses
            </h3>
            <ul className="space-y-2 text-sm text-foreground">
              {state.data.report.weaknesses.map((item) => (
                <li key={item} className="rounded-xl border border-border/70 bg-muted/20 px-3 py-2">
                  {item}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section className="space-y-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Recommendations
          </h3>
          <ul className="space-y-2 text-sm text-foreground">
            {state.data.report.recommendations.map((item) => (
              <li key={item} className="rounded-xl border border-border/70 bg-primary/5 px-3 py-2">
                {item}
              </li>
            ))}
          </ul>
        </section>

        <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Confidence Note
          </p>
          <p className="mt-1 text-sm text-foreground">{state.data.report.confidenceNote}</p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/70 pt-3 text-xs text-muted-foreground">
          <span>
            This analysis includes your predictions for {state.data.scoredPredictionCount} completed games.
          </span>
          <span>
            {state.data.source === "cache" ? "Cached" : "Generated"} • Updated{" "}
            {formatTimestamp(state.data.generatedAt)}
          </span>
        </div>
      </div>
    );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          className="border-amber-400/70 bg-gradient-to-r from-amber-300 via-yellow-300 to-orange-300 text-slate-950 shadow-[0_10px_30px_-12px_rgba(251,191,36,0.85)] hover:from-amber-200 hover:via-yellow-200 hover:to-orange-200 dark:border-amber-300/40 dark:from-amber-300 dark:via-yellow-200 dark:to-orange-300 dark:text-slate-950 dark:shadow-[0_12px_36px_-14px_rgba(251,191,36,0.65)]"
          variant="outline"
        >
          <Sparkles className="h-4 w-4" />
          AI Analysis
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader className="border-b border-border/70">
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            AI Analysis
          </DialogTitle>
          <DialogDescription>
            Performance analysis generated from your scored fantasy prediction history. AI can make mistakes, so use it as guidance rather than a guaranteed recommendation.
          </DialogDescription>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
}
