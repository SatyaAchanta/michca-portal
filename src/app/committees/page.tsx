import { Mail, Phone, Users } from "lucide-react";

import { PageContainer } from "@/components/page-container";
import { Card } from "@/components/ui/card";
import { SiteFooter } from "@/components/site-footer";

const committees = [
  {
    name: "Rules and Disciplinary Committee",
    email: "micricketrules@gmail.com",
    members: [
      { name: "Kartheek Yalamanchili", phone: "248 952 7557" },
      { name: "Naveen Chugh", phone: "586 342 4795" },
      { name: "Tarik Khan", phone: "414 630 4133" },
    ],
  },
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

export default function CommitteesPage() {
  return (
    <>
      <div className="bg-background py-12">
        <PageContainer className="space-y-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Committees
            </h1>
            <p className="max-w-3xl text-sm text-muted-foreground sm:text-base">
              MichCA 2025-2026 operational committees managing various aspects of the league
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {committees.map((committee) => (
              <Card
                key={committee.name}
                className="flex flex-col space-y-4 p-6 border-primary/15 bg-gradient-to-br from-blue-50/50 via-white to-blue-50/50 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="space-y-2">
                  <h2 className="text-lg font-semibold text-foreground">
                    {committee.name}
                  </h2>
                  <a
                    href={`mailto:${committee.email}`}
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <Mail className="h-4 w-4" />
                    {committee.email}
                  </a>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>Members</span>
                  </div>
                  <ul className="space-y-2">
                    {committee.members.map((member, index) => (
                      <li key={index} className="space-y-1">
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
