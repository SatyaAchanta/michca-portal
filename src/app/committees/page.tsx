import Image from "next/image";
import { Mail, Phone, Users } from "lucide-react";

import { PageContainer } from "@/components/page-container";
import { Card } from "@/components/ui/card";
import { SiteFooter } from "@/components/site-footer";

const leadership = [
  { name: "Tayefur Rahman", role: "Chairman", image: "/executives/tayefur.jpeg" },
  { name: "Hardeep Singh", role: "Vice Chairman", image: "/executives/hardeep.webp" },
  { name: "Praveen Choudhury", role: "Secretary", image: "/executives/praveen.webp" },
  { name: "Ravi Chalanti", role: "Treasurer", image: "/executives/ravi.webp" },
  { name: "Iftekar Ahmad", role: "Public Relations", image: "/executives/iftekar.jpeg" },
];

const committees = [

  {
    name: "Stats Committee",
    email: "micricketstats@gmail.com",
    members: [
      { name: "Siddharth Mohapatra", phone: "734 548 2022" },
      { name: "Hemanth Krishna Chundi", phone: "607 727 4101" },
    ],
  },
  {
    name: "Umpiring Committee",
    email: "micricketumpires@gmail.com",
    members: [
      { name: "Onkar Akolkar", phone: "256 603 1286", note: "Umpire Mentor and Trainer" },
      { name: "Vijay Khammam", phone: "870 877 1518" },
      { name: "Hemanth Krishna Chundi", phone: "607 727 4101" },
    ],
  },
  {
    name: "Media",
    email: "micricketmedia@gmail.com",
    members: [
      { name: "Andy Koilpillai", phone: "248 943 6053" },
    ],
  },
  {
    name: "Fantasy League",
    email: "micricketmedia@gmail.com",
    members: [
      { name: "Satya Achanta", phone: "734 383 0393" },
      { name: "Talha Asad", phone: "512 758 1742" },
    ],
  },
  {
    name: "Waiver Committee",
    email: "micricketwaiver@gmail.com",
    members: [
      { name: "Nagendar Kolipaka", phone: "763 772 6306" },
    ],
  },
];

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export default function CommitteesPage() {
  const topLeadership = leadership.slice(0, 2);
  const bottomLeadership = leadership.slice(2);

  return (
    <>
      <div className="bg-background py-12">
        <PageContainer className="space-y-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Leadership
            </h1>
            <p className="max-w-3xl text-sm text-muted-foreground sm:text-base">
              Meet the league leadership and operational committees for the 2025-2026 season.
            </p>
          </div>

          <Card className="space-y-6 border border-border/70 bg-gradient-to-br from-card via-background to-secondary/30 p-6 shadow-sm">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold">Executive Leadership</h2>
              <p className="text-sm text-muted-foreground">
                The leadership team guides league strategy, governance, and match-day
                standards across Michigan.
              </p>
            </div>
            <div className="space-y-5">
              <div className="mx-auto grid max-w-3xl grid-cols-1 gap-5 sm:grid-cols-2">
                {topLeadership.map((member) => (
                  <div
                    key={member.name}
                    className="mx-auto flex w-full max-w-sm flex-col items-center rounded-xl border border-border/70 bg-background/80 p-5 text-center shadow-sm transition-colors hover:border-primary/30"
                  >
                    <div className="relative h-20 w-20 overflow-hidden rounded-full border border-border/70 ring-2 ring-primary/10">
                      <Image
                        src={member.image}
                        alt={`${member.name} - ${member.role}`}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </div>
                    <div className="mt-3 space-y-1">
                      <p className="text-base font-semibold text-foreground">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.role}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mx-auto grid max-w-5xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {bottomLeadership.map((member) => (
                  <div
                    key={member.name}
                    className="mx-auto flex w-full max-w-sm flex-col items-center rounded-xl border border-border/70 bg-background/80 p-5 text-center shadow-sm transition-colors hover:border-primary/30"
                  >
                    <div className="relative h-20 w-20 overflow-hidden rounded-full border border-border/70 ring-2 ring-primary/10">
                      <Image
                        src={member.image}
                        alt={`${member.name} - ${member.role}`}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </div>
                    <div className="mt-3 space-y-1">
                      <p className="text-base font-semibold text-foreground">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Committees</h2>
            <p className="text-sm text-muted-foreground">
              Operational committees support rules, statistics, umpiring, media, and other
              league initiatives.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {committees.map((committee) => (
              <Card
                key={committee.name}
                className="flex h-full flex-col space-y-5 rounded-xl border border-border/70 bg-gradient-to-br from-card via-background to-secondary/20 p-6 shadow-sm"
              >
                <div className="space-y-2">
                  <h2 className="text-lg font-semibold leading-tight text-foreground">
                    {committee.name}
                  </h2>
                  <a
                    href={`mailto:${committee.email}`}
                    className="flex items-center gap-2 break-all text-sm text-primary hover:underline"
                  >
                    <Mail className="h-4 w-4" />
                    {committee.email}
                  </a>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>Members</span>
                  </div>
                  <ul className="space-y-3">
                    {committee.members.map((member, index) => (
                      <li key={index} className="flex items-start gap-3 rounded-lg border border-border/60 bg-background/70 p-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                          {getInitials(member.name)}
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-foreground">
                            {member.name}
                          </p>
                          <a
                            href={`tel:${member.phone.replace(/\s/g, "")}`}
                            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary"
                          >
                            <Phone className="h-3 w-3" />
                            {member.phone}
                          </a>
                          {member.note && (
                            <p className="text-xs italic text-muted-foreground">
                              {member.note}
                            </p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            ))}
          </div>
        </PageContainer>
      </div>
      <SiteFooter />
    </>
  );
}
