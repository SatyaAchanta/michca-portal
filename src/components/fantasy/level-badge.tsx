import { cn } from "@/lib/utils";

const LEVEL_CONFIG: Record<number, { label: string; className: string }> = {
  0: {
    label: "Level 0",
    className: "bg-muted text-muted-foreground border-border",
  },
  1: {
    label: "Level 1",
    className:
      "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-700",
  },
  2: {
    label: "Level 2",
    className:
      "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700",
  },
  3: {
    label: "Level 3",
    className:
      "bg-violet-100 text-violet-800 border-violet-300 dark:bg-violet-900/30 dark:text-violet-400 dark:border-violet-700",
  },
  4: {
    label: "Level 4",
    className:
      "bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-700",
  },
  5: {
    label: "Level 5",
    className:
      "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700",
  },
  6: {
    label: "Level 6",
    className:
      "bg-cyan-100 text-cyan-800 border-cyan-300 dark:bg-cyan-900/30 dark:text-cyan-400 dark:border-cyan-700",
  },
  7: {
    label: "Level 7",
    className:
      "bg-pink-100 text-pink-800 border-pink-300 dark:bg-pink-900/30 dark:text-pink-400 dark:border-pink-700",
  },
  8: {
    label: "Level 8",
    className:
      "bg-yellow-100 text-yellow-900 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700",
  },
};

type LevelBadgeProps = {
  level: number;
  className?: string;
  size?: "sm" | "md";
};

export function LevelBadge({ level, className, size = "md" }: LevelBadgeProps) {
  const config = LEVEL_CONFIG[level] ?? LEVEL_CONFIG[0];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-medium",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-0.5 text-sm",
        config.className,
        className,
      )}
    >
      {config.label}
    </span>
  );
}
