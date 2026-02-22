"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  UMPIRING_DATE_OPTIONS,
  UMPIRING_LOCATION_OPTIONS,
  type UmpiringTrainingDateOptionValue,
} from "@/components/umpiring-training/validation";
import { serializeFilterValues } from "@/components/umpiring-training/admin-formatters";

type AdminFiltersProps = {
  initialDates: UmpiringTrainingDateOptionValue[];
  initialLocations: string[];
};

function toggleValue(values: string[], value: string) {
  if (values.includes(value)) {
    return values.filter((entry) => entry !== value);
  }
  return [...values, value];
}

export function AdminFilters({ initialDates, initialLocations }: AdminFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [selectedDates, setSelectedDates] = useState<UmpiringTrainingDateOptionValue[]>(
    initialDates
  );
  const [selectedLocations, setSelectedLocations] = useState<string[]>(initialLocations);

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (selectedDates.length > 0) {
      params.set("dates", serializeFilterValues(selectedDates));
    }
    if (selectedLocations.length > 0) {
      params.set("locations", serializeFilterValues(selectedLocations));
    }
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  const clearFilters = () => {
    setSelectedDates([]);
    setSelectedLocations([]);
    router.push(pathname);
  };

  return (
    <Card className="space-y-4 p-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <p className="text-sm font-medium">Filter by Dates</p>
          <div className="space-y-2">
            {UMPIRING_DATE_OPTIONS.map((option) => (
              <label key={option.value} className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={selectedDates.includes(option.value)}
                  onCheckedChange={() =>
                    setSelectedDates((prev) =>
                      toggleValue(prev, option.value) as UmpiringTrainingDateOptionValue[]
                    )
                  }
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Filter by Location</p>
          <div className="space-y-2">
            {UMPIRING_LOCATION_OPTIONS.map((option) => (
              <label key={option} className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={selectedLocations.includes(option)}
                  onCheckedChange={() =>
                    setSelectedLocations((prev) => toggleValue(prev, option))
                  }
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" onClick={applyFilters}>
          Apply
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={clearFilters}>
          Clear Filters
        </Button>
      </div>
    </Card>
  );
}

