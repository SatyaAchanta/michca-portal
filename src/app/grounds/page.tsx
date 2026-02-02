"use client";

import { useMemo, useState } from "react";
import { MapPin } from "lucide-react";

import { PageContainer } from "@/components/page-container";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { grounds } from "@/lib/data";

export default function GroundsPage() {
  const [search, setSearch] = useState("");

  const filteredGrounds = useMemo(() => {
    return grounds.filter((ground) => {
      const query = search.trim().toLowerCase();
      return query
        ? [ground.name, ground.shortName, ground.address]
            .join(" ")
            .toLowerCase()
            .includes(query)
        : true;
    });
  }, [search]);

  const openInMaps = (address: string) => {
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    window.open(mapsUrl, "_blank");
  };

  return (
    <div className="bg-background py-12">
      <PageContainer className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Grounds & Venues
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
            Explore cricket grounds and venues across Michigan and surrounding areas.
          </p>
        </div>

        <div className="rounded-xl border border-border/70 bg-card p-4">
          <Input
            placeholder="Search grounds by name or location"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        {filteredGrounds.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredGrounds.map((ground) => (
              <Card key={ground.id} className="flex h-full flex-col justify-between p-6">
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-base font-semibold text-foreground">
                      {ground.name}
                    </h3>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {ground.shortName}
                  </p>
                  <div className="mt-3 flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">{ground.address}</p>
                  </div>
                </div>
                <div className="mt-6">
                  <Button
                    onClick={() => openInMaps(ground.address)}
                    size="sm"
                    className="w-full cursor-pointer"
                  >
                    <MapPin className="h-4 w-4" />
                    Open in Maps
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No grounds found"
            description="Try a different search term."
          />
        )}
      </PageContainer>
    </div>
  );
}
