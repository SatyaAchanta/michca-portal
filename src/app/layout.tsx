import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { Analytics } from "@vercel/analytics/next";
import { getOrCreateCurrentUserProfile } from "@/lib/user-profile";
import { isAnyAdminRole } from "@/lib/roles";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "MichCA - Michigan Cricket Association",
    template: "%s | MichCA",
  },
  description:
    "Official website of Michigan Cricket Association (Mich-CA). View leagues, schedules, teams, umpires, and cricket news across Michigan.",
  openGraph: {
    title: "MichCA - Michigan Cricket Association",
    description:
      "Official website of Michigan Cricket Association (Mich-CA). View leagues, schedules, teams, umpires, and cricket news across Michigan.",
    url: "https://www.michcausa.org",
    siteName: "MichCA",
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "MichCA - Michigan Cricket Association",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MichCA - Michigan Cricket Association",
    description:
      "Official website of Michigan Cricket Association (Mich-CA). View leagues, schedules, teams, umpires, and cricket news across Michigan.",
    images: ["/twitter-image"],
  },
  icons: {
    icon: "/michca.png",
    shortcut: "/michca.png",
    apple: "/michca.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { userId } = await auth();
  let isAdmin = false;

  if (userId) {
    try {
      const profile = await getOrCreateCurrentUserProfile();
      isAdmin = isAnyAdminRole(profile.role);
    } catch {
      isAdmin = false;
    }
  }

  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${poppins.variable} bg-background text-foreground antialiased`}
        >
          <SiteHeader isAdmin={isAdmin} />
          <main className="min-h-screen">{children}</main>
          <Analytics />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "SportsOrganization",
                name: "Michigan Cricket Association",
                alternateName: "MichCA",
                url: "https://www.michcausa.org",
                logo: "https://www.michcausa.org/michca.png",
                sport: "Cricket",
                areaServed: "Michigan, USA",
              }),
            }}
          />
        </body>
      </html>
    </ClerkProvider>
  );
}
