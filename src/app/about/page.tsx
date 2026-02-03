import { PageContainer } from "@/components/page-container";
import { Card } from "@/components/ui/card";
import { SiteFooter } from "@/components/site-footer";

export default function AboutPage() {
  return (
    <>
      <div className="bg-background py-12">
      <PageContainer className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Our Story
          </h1>
          <p className="max-w-3xl text-sm text-muted-foreground sm:text-base">
            A non-profit organization established in 2001, nurturing competitive cricket across Michigan.
          </p>
        </div>

        <Card className="space-y-4 p-6 border border-border/70 bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 shadow-md">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">Our Mission</h2>
            <p className="mt-2 text-sm font-medium text-muted-foreground">Non-profit organization registered with the state of Michigan since 2001</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-primary">Quality & Standards</h3>
              <p className="text-sm text-muted-foreground">
                Control and improve the quality of cricket in Michigan, establishing policies and regulations while maintaining accountability, transparency, and integrity as core values.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-primary">Promotion & Development</h3>
              <p className="text-sm text-muted-foreground">
                Organize ODIs, T20s, and tournaments. Establish coaching academies and schemes to promote cricket welfare and eliminate unethical practices.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-primary">Sportsmanship & Ethics</h3>
              <p className="text-sm text-muted-foreground">
                Foster professionalism and ethical standards in players, officials, and administrators. Ban all forms of inequity and discrimination.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-primary">Community Building</h3>
              <p className="text-sm text-muted-foreground">
                Encourage formation of cricket clubs and teams across Michigan. Arrange matches and tournaments throughout the USA with ICC-approved organizations.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-primary">Youth Development</h3>
              <p className="text-sm text-muted-foreground">
                Organize youth coaching camps, facilitate participation in national and international tournaments, and seed cricket at school and community levels.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-primary">Governance</h3>
              <p className="text-sm text-muted-foreground">
                Appoint representatives to USA National Cricket Governing Body approved by ICC. Constitute committees to oversee various functions and development.
              </p>
            </div>
          </div>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Teams", value: "101" },
            { label: "Divisions", value: "6" },
            { label: "Matches", value: "500+" },
            { label: "Grounds", value: "14" },
          ].map((stat) => (
            <Card
              key={stat.label}
              className="border border-border/70 bg-gradient-to-br from-blue-50/50 via-white to-blue-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 p-6"
            >
              <p className="text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">
                {stat.label}
              </p>
              <p className="mt-3 text-2xl font-semibold text-foreground">{stat.value}</p>
            </Card>
          ))}
        </div>

        <Card className="space-y-3 p-6">
          <h2 className="text-lg font-semibold">Sponsors & Partners</h2>
          <p className="text-sm text-muted-foreground">
            Local partners help us deliver facilities, training, and community events
            throughout the season. We welcome new sponsorships each year to grow the game.
          </p>
        </Card>
      </PageContainer>
      </div>
      <SiteFooter />
    </>
  );
}
