import Link from "next/link";
import { Calendar, DollarSign, RefreshCw, ExternalLink, Info } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const REGISTRATION_FORM_URL = "https://forms.gle/E4jetCEnAtSFuRvK9";
const FINAL_DEADLINE = new Date("2026-04-07");
const REGISTRATION_DEADLINE = "Feb 25, 2026";
const PAYMENT_DEADLINE = "Mar 31, 2026";

const deadlines = [
  {
    date: REGISTRATION_DEADLINE,
    label: "Registration Deadline",
    icon: Calendar,
  },
  {
    date: PAYMENT_DEADLINE,
    label: "Full Payment Deadline",
    icon: DollarSign,
  },
  {
    date: "Apr 7, 2026",
    label: "Final Refund Date",
    icon: RefreshCw,
  },
];

export function RegistrationBanner() {
  // Hide banner after final deadline
  const currentDate = new Date();
  if (currentDate > FINAL_DEADLINE) {
    return null;
  }

  return (
    <Card className="border border-border/60 bg-background/90 px-4 py-3 shadow-none">
      <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-between sm:text-left">
        <div className="flex flex-col items-center gap-2 text-sm sm:items-start">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Open
            </span>
            <p className="font-medium text-foreground">Team registrations are open.</p>
          </div>
          <div className="inline-flex items-center gap-1 rounded-md border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary sm:text-sm">
            <Calendar className="h-3.5 w-3.5" />
            <span>Registration deadline: {REGISTRATION_DEADLINE}</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0 text-primary/80 hover:bg-transparent hover:text-primary"
                >
                  <Info className="h-3.5 w-3.5" />
                  <span className="sr-only">View important deadlines</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="start">
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-foreground">
                    Important Deadlines
                  </h4>
                  <div className="space-y-2">
                    {deadlines.map((deadline) => (
                      <div
                        key={deadline.label}
                        className="flex items-start gap-3 rounded-lg bg-muted/50 p-3"
                      >
                        <deadline.icon className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-foreground">
                            {deadline.date}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {deadline.label}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <Button asChild size="sm">
          <Link href={REGISTRATION_FORM_URL} target="_blank" rel="noreferrer">
            Register
            <ExternalLink className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </Card>
  );
}
