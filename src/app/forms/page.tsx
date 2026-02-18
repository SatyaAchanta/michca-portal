"use client";

import { useMemo, useState } from "react";
import { Mail } from "lucide-react";

import { PageContainer } from "@/components/page-container";
import { DocCard } from "@/components/doc-card";
import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { documents } from "@/lib/data";

export default function FormsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const categories = useMemo(
    () => ["all", ...Array.from(new Set(documents.map((doc) => doc.category)))],
    []
  );

  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const query = search.trim().toLowerCase();
      const searchMatch = query
        ? [doc.title, doc.description ?? "", doc.category]
            .join(" ")
            .toLowerCase()
            .includes(query)
        : true;
      const categoryMatch = category === "all" || doc.category === category;

      return searchMatch && categoryMatch;
    });
  }, [search, category]);

  return (
    <div className="bg-background py-12">
      <PageContainer className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Forms & Documents
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
            Download registration, match day, and league resources.
          </p>
        </div>

        <Card className="border-primary/40 bg-primary/5 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                <h2 className="text-base font-semibold text-foreground">
                  MichCA Zelle Payment
                </h2>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Use this official MichCA finance email for all Zelle payments.
              </p>
            </div>
            <Badge variant="outline">Zelle</Badge>
          </div>
          <div className="mt-4 rounded-md border border-primary/30 bg-background/70 p-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Payment email
            </p>
            <p className="mt-1 break-all text-sm font-semibold text-foreground sm:text-base">
              micricketfinance@gmail.com
            </p>
          </div>
        </Card>

        <div className="grid gap-3 rounded-xl border border-border/70 bg-card p-4 md:grid-cols-[1.2fr_0.8fr]">
          <Input
            placeholder="Search documents"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((categoryOption) => (
                <SelectItem key={categoryOption} value={categoryOption}>
                  {categoryOption === "all" ? "All categories" : categoryOption}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {filteredDocuments.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredDocuments.map((doc) => (
              <DocCard key={doc.id} doc={doc} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No documents found"
            description="Try a different search term or category."
          />
        )}
      </PageContainer>
    </div>
  );
}
