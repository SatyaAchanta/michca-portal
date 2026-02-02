"use client";

import { useMemo, useState } from "react";

import { PageContainer } from "@/components/page-container";
import { DocCard } from "@/components/doc-card";
import { EmptyState } from "@/components/empty-state";
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
