import { Button } from "@/components/ui/button";

type SchedulePaginationProps = {
  page: number;
  totalPages: number;
  totalCount: number;
  isPending: boolean;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  onPrevious: () => void;
  onNext: () => void;
};

export function SchedulePagination({
  page,
  totalPages,
  totalCount,
  isPending,
  hasPreviousPage,
  hasNextPage,
  onPrevious,
  onNext,
}: SchedulePaginationProps) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border/60 bg-card p-4">
      <p className="text-sm text-muted-foreground">
        Page {page} of {totalPages} ({totalCount} games)
      </p>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onPrevious}
          disabled={!hasPreviousPage || isPending}
        >
          Previous
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onNext}
          disabled={!hasNextPage || isPending}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
