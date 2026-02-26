import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forms and Documents",
  description:
    "Access Mich-CA registration forms, player documents, match-day sheets, rules, and official cricket league resources for Michigan teams and players.",
};

export default function FormsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
