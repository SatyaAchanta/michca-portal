"use client";

import { useActionState, useMemo, useRef, useState } from "react";
import Link from "next/link";

import { submitMyWaiver } from "@/app/waiver/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  INITIAL_WAIVER_FORM_STATE,
  WAIVER_SECONDARY_DIVISION_OPTIONS,
  type SecondaryDivisionValue,
  type WaiverFormState,
} from "@/components/waiver/validation";
import {
  WAIVER_RULEBOOK_URL,
  WAIVER_US_STATES,
  WAIVER_SUBMIT_TEXT,
} from "@/lib/waiver-constants";

type TeamOption = {
  teamCode: string;
  teamName: string;
  division: string;
  format: string;
};

type WaiverSnapshot = {
  playerName: string;
  cricclubsId: string;
  state: string | null;
  city: string;
  address: string | null;
  t20Division: string | null;
  t20TeamCode: string | null;
  secondaryDivision: SecondaryDivisionValue | null;
  secondaryTeamCode: string | null;
  signatureName: string;
  submittedAt: string;
};

type WaiverFormProps = {
  waiver: WaiverSnapshot | null;
  t20Divisions: string[];
  teams: TeamOption[];
};

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="text-sm text-destructive">{message}</p>;
}

export function WaiverForm({ waiver, t20Divisions, teams }: WaiverFormProps) {
  const [formState, formAction] = useActionState<WaiverFormState, FormData>(
    submitMyWaiver,
    INITIAL_WAIVER_FORM_STATE,
  );
  const formRef = useRef<HTMLFormElement>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [playerName, setPlayerName] = useState(waiver?.playerName ?? "");
  const [cricclubsId, setCricclubsId] = useState(waiver?.cricclubsId ?? "");
  const [playerState, setPlayerState] = useState(waiver?.state ?? "");
  const [city, setCity] = useState(waiver?.city ?? "");
  const [address, setAddress] = useState(waiver?.address ?? "");
  const [signatureName, setSignatureName] = useState(
    waiver?.signatureName ?? "",
  );
  const [t20Division, setT20Division] = useState(
    waiver ? (waiver.t20Division ?? "N/A") : "",
  );
  const [t20TeamCode, setT20TeamCode] = useState(waiver?.t20TeamCode ?? "");
  const [secondaryDivision, setSecondaryDivision] = useState<
    SecondaryDivisionValue | "N/A" | ""
  >(
    waiver
      ? ((waiver.secondaryDivision ?? "N/A") as SecondaryDivisionValue | "N/A")
      : "",
  );
  const [secondaryTeamCode, setSecondaryTeamCode] = useState(
    waiver?.secondaryTeamCode ?? "",
  );
  const [submitAcknowledgement, setSubmitAcknowledgement] = useState(false);
  const [rulebookAcknowledgement, setRulebookAcknowledgement] = useState(false);

  const t20Teams = useMemo(
    () =>
      t20Division && t20Division !== "N/A"
        ? teams.filter(
            (team) => team.format === "T20" && team.division === t20Division,
          )
        : [],
    [teams, t20Division],
  );
  const secondaryTeams = useMemo(
    () =>
      secondaryDivision && secondaryDivision !== "N/A"
        ? teams.filter((team) => team.division === secondaryDivision)
        : [],
    [teams, secondaryDivision],
  );
  const namesMatch =
    playerName.trim().length > 0 &&
    signatureName.trim().length > 0 &&
    playerName.trim().localeCompare(signatureName.trim(), undefined, {
      sensitivity: "base",
    }) === 0;
  const showNameMismatch =
    signatureName.trim().length > 0 &&
    playerName.trim().length > 0 &&
    !namesMatch;

  const handleOpenConfirmation = (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    event.preventDefault();
    if (
      !submitAcknowledgement ||
      !rulebookAcknowledgement ||
      showNameMismatch ||
      waiver
    ) {
      return;
    }

    const form = formRef.current;
    if (!form) {
      return;
    }

    if (!form.reportValidity()) {
      return;
    }

    setIsDialogOpen(true);
  };

  const handleConfirm = () => {
    const form = formRef.current;
    if (!form) {
      return;
    }

    if (!form.reportValidity()) {
      setIsDialogOpen(false);
      return;
    }

    setIsDialogOpen(false);
    form.requestSubmit();
  };

  return (
    <>
      <form ref={formRef} action={formAction} className="space-y-6">
        <Card className="space-y-6 p-5 sm:p-6">
          <div className="grid gap-4 md:grid-cols-2 md:items-start">
            <div className="space-y-2">
              <label htmlFor="playerName" className="text-sm font-medium">
                Player Name As In CricClubs
              </label>
              <Input
                id="playerName"
                name="playerName"
                value={playerName}
                onChange={(event) => setPlayerName(event.target.value)}
                required
                disabled={Boolean(waiver)}
              />
              <FieldError message={formState.fieldErrors.playerName} />
            </div>
            <div className="space-y-2">
              <label htmlFor="cricclubsId" className="text-sm font-medium">
                Player CricClubs ID
              </label>
              <Input
                id="cricclubsId"
                name="cricclubsId"
                value={cricclubsId}
                onChange={(event) => setCricclubsId(event.target.value)}
                required
                disabled={Boolean(waiver)}
              />
              <FieldError message={formState.fieldErrors.cricclubsId} />
            </div>
            <div className="space-y-2">
              <label htmlFor="address" className="text-sm font-medium">
                Address
              </label>
              <Input
                id="address"
                name="address"
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                required
                placeholder="Street address"
                disabled={Boolean(waiver)}
              />
              <FieldError message={formState.fieldErrors.address} />
            </div>
            <div className="space-y-2">
              <label htmlFor="city" className="text-sm font-medium">
                City
              </label>
              <Input
                id="city"
                name="city"
                value={city}
                onChange={(event) => setCity(event.target.value)}
                required
                disabled={Boolean(waiver)}
              />
              <FieldError message={formState.fieldErrors.city} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">State</label>
              <input type="hidden" name="state" value={playerState} />
              <Select
                value={playerState}
                onValueChange={setPlayerState}
                disabled={Boolean(waiver)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {WAIVER_US_STATES.map((stateOption) => (
                    <SelectItem key={stateOption} value={stateOption}>
                      {stateOption}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError message={formState.fieldErrors.state} />
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
                disabled={Boolean(waiver)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select T20 division" />
                </SelectTrigger>
                <SelectContent>
                  {t20Divisions.map((division) => (
                    <SelectItem key={division} value={division}>
                      {division}
                    </SelectItem>
                  ))}
                  <SelectItem value="N/A">N/A (does not play T20)</SelectItem>
                </SelectContent>
              </Select>
              <FieldError message={formState.fieldErrors.t20Division} />
            </div>

            {t20Division && t20Division !== "N/A" ? (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Team Name ({t20Division})
                </label>
                <input type="hidden" name="t20TeamCode" value={t20TeamCode} />
                <Select
                  value={t20TeamCode}
                  onValueChange={setT20TeamCode}
                  disabled={Boolean(waiver)}
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
                <FieldError message={formState.fieldErrors.t20TeamCode} />
              </div>
            ) : null}

            <div className="space-y-2">
              <label className="text-sm font-medium">F40 or T30 Division</label>
              <input
                type="hidden"
                name="secondaryDivision"
                value={secondaryDivision}
              />
              <Select
                value={secondaryDivision}
                onValueChange={(value) => {
                  setSecondaryDivision(value as SecondaryDivisionValue | "N/A");
                  setSecondaryTeamCode("");
                }}
                disabled={Boolean(waiver)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select F40 or T30" />
                </SelectTrigger>
                <SelectContent>
                  {WAIVER_SECONDARY_DIVISION_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                  <SelectItem value="N/A">
                    N/A (does not play F40/T30)
                  </SelectItem>
                </SelectContent>
              </Select>
              <FieldError message={formState.fieldErrors.secondaryDivision} />
            </div>

            {secondaryDivision && secondaryDivision !== "N/A" ? (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Team Name ({secondaryDivision})
                </label>
                <input
                  type="hidden"
                  name="secondaryTeamCode"
                  value={secondaryTeamCode}
                />
                <Select
                  value={secondaryTeamCode}
                  onValueChange={setSecondaryTeamCode}
                  disabled={Boolean(waiver)}
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
                <FieldError message={formState.fieldErrors.secondaryTeamCode} />
              </div>
            ) : null}

          </div>

          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
            <div className="space-y-2">
              <label htmlFor="signatureName" className="text-sm font-medium">
                Signature Full Name
              </label>
              <Input
                id="signatureName"
                name="signatureName"
                value={signatureName}
                onChange={(event) => setSignatureName(event.target.value)}
                required
                disabled={Boolean(waiver)}
              />
              <FieldError
                message={
                  showNameMismatch
                    ? "Signature full name must exactly match the player name."
                    : formState.fieldErrors.signatureName
                }
              />
            </div>
            {waiver?.submittedAt ? (
              <p className="text-sm text-muted-foreground md:pb-2">
                Current year submission on{" "}
                {new Date(waiver.submittedAt).toLocaleString("en-US")}
              </p>
            ) : null}
          </div>

          <div className="space-y-3 rounded-lg border border-border/70 bg-muted/20 p-4">
            <input
              type="hidden"
              name="submitAcknowledgement"
              value={submitAcknowledgement ? "yes" : "no"}
            />
            <label className="flex items-center gap-3 text-sm leading-6">
              <Checkbox
                checked={submitAcknowledgement}
                onCheckedChange={(value) =>
                  setSubmitAcknowledgement(value === true)
                }
                disabled={Boolean(waiver)}
              />
              <span className="flex-1">
                I have read the waiver text and agree to submit this form for
                the current year.
              </span>
            </label>
            <FieldError message={formState.fieldErrors.submitAcknowledgement} />
          </div>

          <div className="space-y-3 rounded-lg border border-border/70 bg-muted/20 p-4">
            <input
              type="hidden"
              name="rulebookAcknowledgement"
              value={rulebookAcknowledgement ? "yes" : "no"}
            />
            <label className="flex items-center gap-3 text-sm leading-6">
              <Checkbox
                checked={rulebookAcknowledgement}
                onCheckedChange={(value) =>
                  setRulebookAcknowledgement(value === true)
                }
                disabled={Boolean(waiver)}
              />
              <span className="flex-1">
                I have read the{" "}
                <Link
                  href={WAIVER_RULEBOOK_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-foreground underline underline-offset-4"
                >
                  2026 Mich-CA rulebook
                </Link>{" "}
                and understand all the conditions.
              </span>
            </label>
            <FieldError
              message={formState.fieldErrors.rulebookAcknowledgement}
            />
          </div>
        </Card>

        {formState.fieldErrors.form ? (
          <p className="text-sm text-destructive">
            {formState.fieldErrors.form}
          </p>
        ) : null}
        {formState.message ? (
          <p
            className={`text-sm ${
              formState.status === "success"
                ? "text-green-700 dark:text-green-300"
                : "text-destructive"
            }`}
          >
            {formState.message}
          </p>
        ) : null}

        {waiver ? (
          <Card className="border-amber-500/30 bg-amber-500/5 p-4">
            <p className="text-sm text-muted-foreground">
              You have already submitted waiver. If you need to re-submit with
              updated acknowledgments, contact Waiver Committee to reset it.
            </p>
          </Card>
        ) : (
          <Button
            type="button"
            onClick={handleOpenConfirmation}
            disabled={
              !submitAcknowledgement ||
              !rulebookAcknowledgement ||
              showNameMismatch
            }
          >
            Review & Submit Waiver
          </Button>
        )}
      </form>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl p-0">
          <DialogHeader className="border-b border-border/70 px-6 py-5">
            <DialogTitle>Confirm waiver submission</DialogTitle>
            <DialogDescription>
              Review the confirmation text below. Clicking Confirm will submit
              your waiver.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 px-6 py-5 text-sm leading-7 text-muted-foreground">
            <p>{WAIVER_SUBMIT_TEXT}</p>
            <p>
              Submission date:{" "}
              <span className="font-medium text-foreground">
                {new Intl.DateTimeFormat("en-US", {
                  dateStyle: "full",
                  timeStyle: "short",
                }).format(new Date())}
              </span>
            </p>
          </div>
          <DialogFooter className="border-t border-border/70 px-6 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleConfirm}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
