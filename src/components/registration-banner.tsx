import Link from "next/link";
import { Calendar, DollarSign, RefreshCw, ExternalLink, Info } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const REGISTRATION_FORM_URL = "https://forms.gle/op9QNwjgnSHGHjMN7";
const FINAL_DEADLINE = new Date("2026-04-07");

const deadlines = [
  {
    date: "Feb 25, 2026",
    label: "Registration Deadline",
    icon: Calendar,
  },
  {
    date: "Mar 31, 2026",
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
    <Card className="border-amber-500/40 bg-gradient-to-br from-amber-50 to-orange-50 p-3 shadow-md">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-amber-900">
            ⏰ Registrations are open
          </p>
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                className="h-6 w-6 p-0 text-amber-700 hover:text-amber-900 hover:bg-amber-100/50"
              >
                <Info className="h-4 w-4" />
                <span className="sr-only">View important deadlines</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="start">
              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-foreground">
                  Important Deadlines
                </h4>
                <div className="space-y-2">
                  {deadlines.map((deadline) => (
                    <div
                      key={deadline.label}
                      className="flex items-start gap-3 rounded-lg bg-muted/50 p-3"
                    >
                      <deadline.icon className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
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

        <Button asChild variant="destructive" size="sm">
          <Link href={REGISTRATION_FORM_URL} target="_blank" rel="noreferrer">
            Register Now
            <ExternalLink className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </Card>
  );
}
