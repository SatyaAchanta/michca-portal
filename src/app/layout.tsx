import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { Analytics } from "@vercel/analytics/next";
import { UserRole } from "@/generated/prisma/client";
import { getOrCreateCurrentUserProfile } from "@/lib/user-profile";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "MichCA",
  description:
    "Home of Cricket in Michigan. Stay updated with the latest news, schedules, and events from The MichCA.",
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
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
      isAdmin = profile.role === UserRole.ADMIN;
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
        </body>
      </html>
    </ClerkProvider>
  );
}
