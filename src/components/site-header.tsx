"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, Menu } from "lucide-react";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Schedule", href: "/schedule" },
  { label: "Forms", href: "/forms" },
];

const moreLinks = [
  { label: "Grounds", href: "/grounds" },
  { label: "About", href: "/about" },
  { label: "Fantasy", href: "https://www.fantasyleaguemichca.org", external: true },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-background">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 transition-opacity duration-200 hover:opacity-80">
          <Image src={"/michca.png"} alt="Michigan Cricket Association Logo" width={40} height={40} />
          <p className="text-xl font-semibold text-foreground font-display sm:text-2xl">
            <span className="lg:hidden">
              Mich-<span className="text-red-600">CA</span>
            </span>
            <span className="hidden lg:inline">Michigan Cricket Association</span>
          </p>
        </Link>
        <div className="flex items-center gap-2">
          <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
            <ThemeToggle />
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href} 
                className="relative text-foreground transition-colors duration-200 hover:text-primary after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-primary after:transition-all after:duration-200 hover:after:w-full"
              >
                {link.label}
              </Link>
            ))}
            <Popover open={moreOpen} onOpenChange={setMoreOpen}>
              <PopoverTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-1">
                  More
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform duration-200 ease-out",
                      moreOpen && "rotate-180"
                    )}
                  />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-40 p-2">
                {moreLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    target={link.external ? "_blank" : undefined}
                    rel={link.external ? "noreferrer" : undefined}
                    className="block rounded-md px-3 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground"
                    onClick={() => setMoreOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </PopoverContent>
            </Popover>
          </nav>
          <div className="hidden items-center gap-2 md:flex">
            <SignedOut>
              <Button asChild variant="outline" size="sm">
                <Link href="/sign-in">Sign In</Link>
              </Button>
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
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
                <div className="flex items-center">
                  <ThemeToggle />
                </div>
                <SignedOut>
                  <Button
                    asChild
                    variant="outline"
                    className="justify-start"
                    onClick={() => setOpen(false)}
                  >
                    <Link href="/sign-in">Sign In</Link>
                  </Button>
                </SignedOut>
                <SignedIn>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Signed in
                    </span>
                    <UserButton />
                  </div>
                </SignedIn>
                {navLinks.map((link) => (
                  <Button key={link.href} asChild variant="ghost" className="justify-start" onClick={() => setOpen(false)}>
                    <Link href={link.href}>{link.label}</Link>
                  </Button>
                ))}
                {moreLinks.map((link) => (
                  <Button key={link.href} asChild variant="ghost" className="justify-start" onClick={() => setOpen(false)}>
                    <Link href={link.href} target={link.external ? "_blank" : undefined} rel={link.external ? "noreferrer" : undefined}>
                      {link.label}
                    </Link>
                  </Button>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
