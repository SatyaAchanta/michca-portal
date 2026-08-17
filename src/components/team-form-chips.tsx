import { cn } from "@/lib/utils";
import type { TeamFormResult } from "@/lib/team-form";

function getFormSummary(form: TeamFormResult[]) {
  return `Form: ${form.map((result) => (result === "D" ? "-" : result)).join(" ")}`;
}

export function TeamFormChips({
  form,
  className,
}: {
  form?: TeamFormResult[] | null;
  className?: string;
}) {
  if (!form || form.length === 0) return null;

  return (
    <div className={cn("mt-1.5", className)}>
      <p className="sr-only">{getFormSummary(form)}</p>
      <div
        className="flex items-center gap-1"
        aria-label="Recent form"
        data-testid="team-form"
      >
        {form.slice(-5).map((result, index, visibleForm) => {
          const isLatest = index === visibleForm.length - 1;
          const label =
            result === "W" ? "Win" : result === "L" ? "Loss" : "Draw";

          return (
            <span
              key={`${result}-${index}`}
              aria-label={label}
              data-latest={isLatest ? "true" : undefined}
              data-result={result}
              className={cn(
                "inline-flex h-5 w-5 items-center justify-center rounded-md text-[10px] font-semibold leading-none",
                result === "W" &&
                  "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
                result === "L" &&
                  "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
                result === "D" &&
                  "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
                isLatest && "ring-1 ring-current/35",
              )}
              title={label}
            >
              {result === "D" ? "-" : result}
            </span>
          );
        })}
      </div>
    </div>
  );
}
