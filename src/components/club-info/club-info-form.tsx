"use client";

import { useActionState, useMemo, useState } from "react";
import Link from "next/link";

import { submitMyClubInfo } from "@/app/club-info/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  INITIAL_CLUB_INFO_FORM_STATE,
  type ClubInfoFormState,
} from "@/components/club-info/validation";

type TeamOption = {
  teamCode: string;
  teamName: string;
  division: string;
  format: string;
};

type ClubInfoSnapshot = {
  accountEmail: string;
  captainName: string;
  cricclubsId: string;
  contactNumber: string;
  t20Division: string | null;
  t20TeamCode: string | null;
  secondaryDivision: string | null;
  secondaryTeamCode: string | null;
  createdAt: string;
};

type ClubInfoFormProps = {
  accountEmail: string;
  initialCaptainName: string;
  initialContactNumber: string;
  submission: ClubInfoSnapshot | null;
  t20Divisions: string[];
  teams: TeamOption[];
};

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="text-sm text-destructive">{message}</p>;
}

function findTeamLabel(teamCode: string | null, teams: TeamOption[]) {
  if (!teamCode) {
    return "N/A";
  }

  const match = teams.find((team) => team.teamCode === teamCode);
  return match ? match.teamName : teamCode;
}

export function ClubInfoForm({
  accountEmail,
  initialCaptainName,
  initialContactNumber,
  submission,
  t20Divisions,
  teams,
}: ClubInfoFormProps) {
  const [state, formAction] = useActionState<ClubInfoFormState, FormData>(
    submitMyClubInfo,
    INITIAL_CLUB_INFO_FORM_STATE,
  );
  const [captainName, setCaptainName] = useState(initialCaptainName);
  const [cricclubsId, setCricclubsId] = useState("");
  const [contactNumber, setContactNumber] = useState(initialContactNumber);
  const [t20Division, setT20Division] = useState("");
  const [t20TeamCode, setT20TeamCode] = useState("");
  const [secondaryDivision, setSecondaryDivision] = useState("");
  const [secondaryTeamCode, setSecondaryTeamCode] = useState("");

  const t20Teams = useMemo(
    () =>
      t20Division && t20Division !== "N/A"
        ? teams.filter((team) => team.format === "T20" && team.division === t20Division)
        : [],
    [teams, t20Division],
  );
  const secondaryTeams = useMemo(
    () =>
      secondaryDivision && secondaryDivision !== "N/A"
        ? teams.filter((team) => team.format === secondaryDivision)
        : [],
    [teams, secondaryDivision],
  );

  if (submission) {
    return (
      <Card className="space-y-4 p-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight">Club Info Submitted</h2>
          <p className="text-sm text-muted-foreground">
            This declaration is locked after submission. If you need to make a change, contact
            the Stats Committee from the committees page.
          </p>
        </div>
        <div className="grid gap-4 text-sm md:grid-cols-2">
          <div>
            <p className="text-muted-foreground">Account Email</p>
            <p className="font-medium text-foreground">{submission.accountEmail}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Captain Name</p>
            <p className="font-medium text-foreground">{submission.captainName}</p>
          </div>
          <div>
            <p className="text-muted-foreground">CricClubs ID</p>
            <p className="font-medium text-foreground">{submission.cricclubsId}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Contact Number</p>
            <p className="font-medium text-foreground">{submission.contactNumber}</p>
          </div>
          <div>
            <p className="text-muted-foreground">T20 Team</p>
            <p className="font-medium text-foreground">
              {findTeamLabel(submission.t20TeamCode, teams)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">F40/T30 Team</p>
            <p className="font-medium text-foreground">
              {findTeamLabel(submission.secondaryTeamCode, teams)}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <Link href="/committees">Contact Stats Committee</Link>
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <form action={formAction} className="space-y-6">
      <Card className="space-y-6 p-5 sm:p-6">
        <div className="grid gap-4 md:grid-cols-2 md:items-start">
          <div className="space-y-2">
            <label htmlFor="accountEmail" className="text-sm font-medium">
              Email Address
            </label>
            <Input id="accountEmail" value={accountEmail} readOnly disabled />
          </div>
          <div className="space-y-2">
            <label htmlFor="captainName" className="text-sm font-medium">
              Captain Name
            </label>
            <Input
              id="captainName"
              name="captainName"
              value={captainName}
              onChange={(event) => setCaptainName(event.target.value)}
              required
            />
            <FieldError message={state.fieldErrors.captainName} />
          </div>
          <div className="space-y-2">
            <label htmlFor="cricclubsId" className="text-sm font-medium">
              CricClubs Profile ID
            </label>
            <Input
              id="cricclubsId"
              name="cricclubsId"
              value={cricclubsId}
              onChange={(event) => setCricclubsId(event.target.value)}
              required
            />
            <FieldError message={state.fieldErrors.cricclubsId} />
          </div>
          <div className="space-y-2">
            <label htmlFor="contactNumber" className="text-sm font-medium">
              Contact Number
            </label>
            <Input
              id="contactNumber"
              name="contactNumber"
              value={contactNumber}
              onChange={(event) => setContactNumber(event.target.value)}
              inputMode="tel"
              required
            />
            <FieldError message={state.fieldErrors.contactNumber} />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 md:items-start">
          <div className="space-y-2">
            <label className="text-sm font-medium">T20 Division</label>
            <input type="hidden" name="t20Division" value={t20Division} />
            <Select
              value={t20Division}
              onValueChange={(value) => {
                setT20Division(value);
                setT20TeamCode("");
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select T20 division" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="N/A">N/A</SelectItem>
                {t20Divisions.map((division) => (
                  <SelectItem key={division} value={division}>
                    {division}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError message={state.fieldErrors.t20Division} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">T20 Team</label>
            <input type="hidden" name="t20TeamCode" value={t20TeamCode} />
            <Select
              value={t20TeamCode}
              onValueChange={setT20TeamCode}
              disabled={!t20Division || t20Division === "N/A"}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select T20 team" />
              </SelectTrigger>
              <SelectContent>
                {t20Teams.map((team) => (
                  <SelectItem key={team.teamCode} value={team.teamCode}>
                    {team.teamName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError message={state.fieldErrors.t20TeamCode} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">F40 or T30 Division</label>
            <input type="hidden" name="secondaryDivision" value={secondaryDivision} />
            <Select
              value={secondaryDivision}
              onValueChange={(value) => {
                setSecondaryDivision(value);
                setSecondaryTeamCode("");
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select F40 or T30" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="N/A">N/A</SelectItem>
                <SelectItem value="F40">F40</SelectItem>
                <SelectItem value="T30">T30</SelectItem>
              </SelectContent>
            </Select>
            <FieldError message={state.fieldErrors.secondaryDivision} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">F40 or T30 Team</label>
            <input type="hidden" name="secondaryTeamCode" value={secondaryTeamCode} />
            <Select
              value={secondaryTeamCode}
              onValueChange={setSecondaryTeamCode}
              disabled={!secondaryDivision || secondaryDivision === "N/A"}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select F40 or T30 team" />
              </SelectTrigger>
              <SelectContent>
                {secondaryTeams.map((team) => (
                  <SelectItem key={team.teamCode} value={team.teamCode}>
                    {team.teamName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError message={state.fieldErrors.secondaryTeamCode} />
          </div>
        </div>

        {state.fieldErrors.form ? (
          <p className="text-sm text-destructive">{state.fieldErrors.form}</p>
        ) : null}
        {state.message ? (
          <p
            className={`text-sm ${
              state.status === "success" ? "text-green-700 dark:text-green-300" : "text-destructive"
            }`}
          >
            {state.message}
          </p>
        ) : null}

        <Button type="submit">Submit Club Info</Button>
      </Card>
    </form>
  );
}
