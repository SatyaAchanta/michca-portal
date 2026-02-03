import Link from "next/link";
import { Facebook, Instagram, Youtube, Mail, MapPin, Phone } from "lucide-react";

const footerLinks = {
  resources: [
    { label: "Schedule", href: "/schedule" },
    { label: "Grounds", href: "/grounds" },
    { label: "Forms", href: "/forms" },
    { label: "About", href: "/about" },
  ],
  contact: [
    { icon: MapPin, label: "Detroit, Michigan 48310" },
    { icon: Mail, label: "communications@michca.org" },
    { icon: Phone, label: "Contact Us" },
  ],
  social: [
    {
      icon: Facebook,
      label: "Facebook",
      href: "https://www.facebook.com/MichiganCricketAssociationUSA/",
      color: "hover:bg-blue-600",
    },
    {
      icon: Instagram,
      label: "Instagram",
      href: "https://www.instagram.com/michca2001/?hl=en",
      color: "hover:bg-pink-600",
    },
    {
      icon: Youtube,
      label: "YouTube",
      href: "https://www.youtube.com/channel/UCsFOLC2_wHIVfSAkTqZrwQA",
      color: "hover:bg-red-600",
    },
  ],
};

export function SiteFooter() {
  return (
    <footer className="border-t border-border/70 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-4">
          {/* About Section */}
          <div className="lg:col-span-2">
            <h3 className="mb-4 text-lg font-bold text-foreground">
              Michigan Cricket Association
            </h3>
            <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
              A non-profit organization established in 2001, dedicated to nurturing
              competitive cricket across Michigan. We promote sportsmanship,
              professionalism, and community engagement through organized leagues
              and tournaments.
            </p>
            <div className="flex flex-wrap gap-3">
              {footerLinks.social.map((social) => {
                const Icon = social.icon;
                return (
                  <Link
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary transition-all duration-200 hover:scale-110 hover:text-white ${social.color}`}
                    aria-label={social.label}
                  >
                    <Icon className="h-5 w-5" />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-foreground">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-foreground">
              Contact
            </h3>
            <ul className="space-y-3">
              {footerLinks.contact.map((item, index) => {
                const Icon = item.icon;
                return (
                  <li key={index} className="flex items-start gap-2">
                    <Icon className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                    <span className="text-sm text-muted-foreground">{item.label}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-border/50 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground sm:flex-row">
            <p>© {new Date().getFullYear()} Michigan Cricket Association. All rights reserved.</p>
            <p className="text-xs">
              Established in 2001 | Non-Profit Organization
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
