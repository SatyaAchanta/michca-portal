"use client";

import { useActionState } from "react";

import type { UpdateTeamProfileState } from "@/app/admin/teams/actions";
import { updateTeamProfile } from "@/app/admin/teams/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { TeamFormat } from "@/generated/prisma/client";
import {
  getTeamDivisionLabel,
  TEAM_FORMAT_LABELS,
} from "@/lib/team-data";

const INITIAL_STATE: UpdateTeamProfileState = {
  status: "idle",
};

type TeamProfileFormProps = {
  team: {
    teamCode: string;
    format: TeamFormat;
    division: string;
    teamShortCode: string;
    teamName: string;
    description: string | null;
    captainId: string | null;
    viceCaptainId: string | null;
    facebookPage: string | null;
    instagramPage: string | null;
    logo: string | null;
  };
  profiles: Array<{
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
  }>;
};

function getProfileLabel(profile: TeamProfileFormProps["profiles"][number]) {
  const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(" ").trim();
  return fullName.length > 0 ? `${fullName} (${profile.email})` : profile.email;
}

export function TeamProfileForm({ team, profiles }: TeamProfileFormProps) {
  const [state, formAction, isPending] = useActionState(updateTeamProfile, INITIAL_STATE);

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="teamCode" value={team.teamCode} />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="teamCode">
            Team Code
          </label>
          <Input id="teamCode" value={team.teamCode} readOnly disabled />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="teamShortCode">
            Team Short Code
          </label>
          <Input id="teamShortCode" value={team.teamShortCode} readOnly disabled />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="format">
            Format
          </label>
          <Input id="format" value={TEAM_FORMAT_LABELS[team.format]} readOnly disabled />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="division">
            Division
          </label>
          <Input id="division" value={getTeamDivisionLabel(team.division)} readOnly disabled />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium" htmlFor="teamName">
          Team Name
        </label>
        <Input id="teamName" name="teamName" defaultValue={team.teamName} required />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium" htmlFor="description">
          Description
        </label>
        <Textarea
          id="description"
          name="description"
          defaultValue={team.description ?? ""}
          placeholder="Brief history, identity, or season notes"
          rows={5}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="captainId">
            Captain
          </label>
          <select
            id="captainId"
            name="captainId"
            defaultValue={team.captainId ?? ""}
            className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">Unassigned</option>
            {profiles.map((profile) => (
              <option key={profile.id} value={profile.id}>
                {getProfileLabel(profile)}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="viceCaptainId">
            Vice Captain
          </label>
          <select
            id="viceCaptainId"
            name="viceCaptainId"
            defaultValue={team.viceCaptainId ?? ""}
            className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">Unassigned</option>
            {profiles.map((profile) => (
              <option key={profile.id} value={profile.id}>
                {getProfileLabel(profile)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="facebookPage">
            Facebook Page
          </label>
          <Input
            id="facebookPage"
            name="facebookPage"
            defaultValue={team.facebookPage ?? ""}
            placeholder="https://facebook.com/your-team"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="instagramPage">
            Instagram Page
          </label>
          <Input
            id="instagramPage"
            name="instagramPage"
            defaultValue={team.instagramPage ?? ""}
            placeholder="https://instagram.com/your-team"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium" htmlFor="logo">
          Logo URL
        </label>
        <Input
          id="logo"
          name="logo"
          defaultValue={team.logo ?? ""}
          placeholder="https://..."
        />
      </div>

      {state.status === "success" && state.message ? (
        <p className="text-sm text-green-600 dark:text-green-400">{state.message}</p>
      ) : null}
      {state.status === "error" && state.message ? (
        <p className="text-sm text-destructive">{state.message}</p>
      ) : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving..." : "Save Team Profile"}
      </Button>
    </form>
  );
}
