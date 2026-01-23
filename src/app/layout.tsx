import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "MichCA Season Hub",
  description:
    "Michigan Cricket Association season hub with schedules, fantasy league, umpiring, and documents.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} bg-background text-foreground antialiased`}
      >
        <SiteHeader />
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  );
}
