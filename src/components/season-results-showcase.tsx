"use client";

import { useState } from "react";
import Image from "next/image";
import { Trophy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageContainer } from "@/components/page-container";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type ResultCategory = "champions" | "runners";

type SeasonResult = {
  division: string;
  image: string;
  year: string;
  teamName: string;
};

const champions2025: SeasonResult[] = [
  { division: "Premier Division - T20", image: "/docs/premier-champions.jpg", year: "2025", teamName: "Greater Detroit CC Panthers" },
  { division: "Division I - T20", image: "/docs/division-1-champions.jpg", year: "2025", teamName: "Killers CC" },
  { division: "Division II - T20", image: "/docs/div-II-champions.jpg", year: "2025", teamName: "Michigan International CA Thunderbirds" },
  { division: "Division III - T20", image: "/docs/div-III-champions.jpg", year: "2025", teamName: "Big League Arena CC Knights" },
  { division: "F40", image: "/docs/f40-champions.jpg", year: "2025", teamName: "Nirvana CC" },
  { division: "T30", image: "/docs/t30-champions.jpg", year: "2025", teamName: "Michigan Rangers CC" },
  { division: "GLT", image: "/docs/glt-champions.jpeg", year: "2025", teamName: "Brothers Union Cricket Club" },
];

const runners2025: SeasonResult[] = [
  { division: "Premier Division - T20", image: "/docs/premier-runners.jpeg", year: "2025", teamName: "Stellar United Sporting Club" },
  { division: "Division I - T20", image: "/docs/division-1-runner.jpeg", year: "2025", teamName: "Michigan Warriors" },
  { division: "Division II - T20", image: "/docs/div-II-runners.jpeg", year: "2025", teamName: "MIGR Single Malt" },
  { division: "Division III - T20", image: "/docs/div-iii-runners.jpeg", year: "2025", teamName: "Sixers Cricket Club" },
  { division: "F40", image: "/docs/f40-runners.jpeg", year: "2025", teamName: "Royal Knights Cricket Club" },
  { division: "T30", image: "/docs/t30-runners.jpeg", year: "2025", teamName: "MICA Falcons" },
  { division: "GLT", image: "/docs/glt-runners.jpeg", year: "2025", teamName: "Great Lakes United" },
];

export function SeasonResultsShowcase() {
  const [selectedCategory, setSelectedCategory] = useState<ResultCategory>("champions");
  const activeResults = selectedCategory === "champions" ? champions2025 : runners2025;
  const activeLabel = selectedCategory === "champions" ? "Champions" : "Runners-up";
  const activeDescription =
    selectedCategory === "champions"
      ? "Congratulations to all our division winners for their outstanding performance this season"
      : "Congratulations to all our runners-up for their excellent performances this season";

  return (
    <PageContainer className="py-16 space-y-12">
      <div className="text-center space-y-2">
        <div className="flex justify-center mb-4">
          <Trophy className="h-12 w-12 text-primary" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          2025 Season {activeLabel}
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {activeDescription}
        </p>
        <div className="mt-6 flex items-center justify-center gap-2">
          <Button
            type="button"
            size="sm"
            variant={selectedCategory === "champions" ? "default" : "outline"}
            onClick={() => setSelectedCategory("champions")}
            aria-pressed={selectedCategory === "champions"}
          >
            Champions
          </Button>
          <Button
            type="button"
            size="sm"
            variant={selectedCategory === "runners" ? "default" : "outline"}
            onClick={() => setSelectedCategory("runners")}
            aria-pressed={selectedCategory === "runners"}
          >
            Runners-up
          </Button>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {activeResults.map((result) => (
          <Dialog key={`${selectedCategory}-${result.division}`}>
            <DialogTrigger asChild>
              <Card className="cursor-zoom-in overflow-hidden border border-border/70 bg-gradient-to-br from-card via-background to-secondary/50 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-secondary/70 to-background">
                  <Image
                    src={result.image}
                    alt={`${result.division} ${activeLabel} ${result.year}`}
                    fill
                    className="object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-primary" />
                    <h3 className="text-base font-semibold text-foreground">
                      {result.division}
                    </h3>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {result.teamName}
                  </p>
                </div>
              </Card>
            </DialogTrigger>
            <DialogContent>
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-lg bg-black">
                <Image
                  src={result.image}
                  alt={`${result.division} ${activeLabel} ${result.year}`}
                  fill
                  className="object-contain"
                />
              </div>
              <DialogHeader className="px-4 pb-4 pt-3 sm:px-6">
                <DialogTitle>{result.division}</DialogTitle>
                <DialogDescription>
                  {result.teamName} - {result.year} {activeLabel}
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        ))}
      </div>
    </PageContainer>
  );
}
