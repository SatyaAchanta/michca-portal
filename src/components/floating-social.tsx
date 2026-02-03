"use client";

import Link from "next/link";
import { Facebook, Instagram, Youtube } from "lucide-react";

const socialLinks = [
  { icon: Facebook, href: "https://www.facebook.com/MichiganCricketAssociationUSA/", label: "Facebook", color: "hover:bg-blue-600" },
  { icon: Instagram, href: "https://www.instagram.com/michca2001/?hl=en", label: "Instagram", color: "hover:bg-pink-600" },
  { icon: Youtube, href: "https://www.youtube.com/channel/UCsFOLC2_wHIVfSAkTqZrwQA", label: "YouTube", color: "hover:bg-red-600" },
];

export function FloatingSocial() {
  return (
    <div className="fixed right-6 top-1/2 z-30 hidden -translate-y-1/2 flex-col gap-3 lg:flex">
      {socialLinks.map((social) => {
        const Icon = social.icon;
        return (
          <Link
            key={social.label}
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`group flex h-12 w-12 items-center justify-center rounded-full bg-primary/90 text-white shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl ${social.color}`}
            aria-label={social.label}
          >
            <Icon className="h-5 w-5" />
          </Link>
        );
      })}
    </div>
  );
}
