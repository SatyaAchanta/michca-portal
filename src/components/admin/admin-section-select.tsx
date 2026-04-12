"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type AdminSectionSelectProps = {
  value: string;
};

const SECTION_OPTIONS = [
  { value: "youth15", label: "Youth 15" },
  { value: "umpiring", label: "Umpiring" },
  { value: "waiver", label: "Waiver Status" },
  { value: "teams", label: "Teams" },
];

export function AdminSectionSelect({ value }: AdminSectionSelectProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <div className="max-w-xs">
      <Select
        value={value}
        onValueChange={(nextValue) => {
          const params = new URLSearchParams(searchParams.toString());
          params.set("section", nextValue);
          router.replace(`${pathname}?${params.toString()}`);
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select a section" />
        </SelectTrigger>
        <SelectContent>
          {SECTION_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
