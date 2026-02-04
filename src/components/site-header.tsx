"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, Facebook, Instagram, Menu, Youtube } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Image from "next/image";

const navLinks = [
  { label: "Schedule", href: "/schedule" },
  { label: "Forms", href: "/forms" },
  { label: "Leadership", href: "/committees" },
];

const moreLinks = [
  { label: "Grounds", href: "/grounds" },
  { label: "About", href: "/about" },
];

const socialLinks = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/MichiganCricketAssociationUSA/",
    icon: Facebook,
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/michca2001/?hl=en",
    icon: Instagram,
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/channel/UCsFOLC2_wHIVfSAkTqZrwQA",
    icon: Youtube,
  },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-background">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 transition-opacity duration-200 hover:opacity-80">
          <Image src={"/michca.png"} alt="Michigan Cricket Association Logo" width={40} height={40} />
          <p className="text-xl font-semibold text-foreground font-display sm:text-2xl">
            <span className="sm:hidden">
              Mich-<span className="text-red-600">CA</span>
            </span>
            <span className="hidden sm:inline">Michigan Cricket Association</span>
          </p>
        </Link>
        <div className="flex items-center gap-2">
          <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href} 
                className="relative text-foreground transition-colors duration-200 hover:text-primary after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-primary after:transition-all after:duration-200 hover:after:w-full"
              >
                {link.label}
              </Link>
            ))}
            <details className="group relative">
              <summary className="flex cursor-pointer list-none items-center gap-1 text-foreground transition-colors duration-200 hover:text-primary">
                More
                <ChevronDown className="h-4 w-4 transition-transform duration-200 group-open:rotate-180" />
              </summary>
              <div className="absolute right-0 mt-3 w-40 rounded-lg border border-border/70 bg-card p-2 shadow-sm">
                {moreLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block rounded-md px-3 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </details>
          </nav>
          <div className="hidden items-center gap-2 md:flex">
            {socialLinks.map((social) => {
              const Icon = social.icon;
              return (
                <Link
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-border/70 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                >
                  <Icon className="h-4 w-4" />
                </Link>
              );
            })}
          </div>
          <ThemeToggle />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open navigation</span>
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Michigan Cricket Association</SheetTitle>
              </SheetHeader>
              <div className="mt-6 flex flex-col gap-4">
                {navLinks.map((link) => (
                  <Button key={link.href} asChild variant="ghost" className="justify-start" onClick={() => setOpen(false)}>
                    <Link href={link.href}>{link.label}</Link>
                  </Button>
                ))}
                {moreLinks.map((link) => (
                  <Button key={link.href} asChild variant="ghost" className="justify-start" onClick={() => setOpen(false)}>
                    <Link href={link.href}>{link.label}</Link>
                  </Button>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-3">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <Link
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-border/70 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                      onClick={() => setOpen(false)}
                    >
                      <Icon className="h-4 w-4" />
                    </Link>
                  );
                })}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
