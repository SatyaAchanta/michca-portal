import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cricket Grounds and Venues",
  description:
    "Find Mich-CA cricket grounds and match venues across Michigan and nearby areas, with searchable locations and quick map directions.",
};

export default function GroundsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
