"use client";

import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  CERTIFICATION_OPTIONS,
  DIETARY_PREFERENCE_OPTIONS,
  type DietaryPreferenceValue,
  type RegistrationFieldErrors,
  type UmpiringTrainingDateOptionValue,
  UMPIRING_DATE_OPTIONS,
  UMPIRING_LOCATION_OPTIONS,
} from "@/components/umpiring-training/validation";

type ProfileValues = {
  firstName: string;
  lastName: string;
  email: string;
};

type RegistrationValues = {
  contactNumber: string;
  affiliation: string;
  preferredDates: UmpiringTrainingDateOptionValue[];
  preferredLocation: string;
  dietaryPreference: DietaryPreferenceValue | "";
  previouslyCertified: string;
  questions: string;
};

type RegistrationFieldsProps = {
  profile: ProfileValues;
  values: RegistrationValues;
  fieldErrors: RegistrationFieldErrors;
  onPreferredDatesChange: (value: UmpiringTrainingDateOptionValue[]) => void;
  onPreferredLocationChange: (value: string) => void;
  onDietaryPreferenceChange: (value: DietaryPreferenceValue) => void;
  onPreviouslyCertifiedChange: (value: string) => void;
};

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="text-xs text-destructive">{message}</p>;
}

export function RegistrationFields({
  profile,
  values,
  fieldErrors,
  onPreferredDatesChange,
  onPreferredLocationChange,
  onDietaryPreferenceChange,
  onPreviouslyCertifiedChange,
}: RegistrationFieldsProps) {
  const togglePreferredDate = (dateValue: UmpiringTrainingDateOptionValue) => {
    const hasDate = values.preferredDates.includes(dateValue);
    const nextDates = hasDate
      ? values.preferredDates.filter((value) => value !== dateValue)
      : [...values.preferredDates, dateValue];
    onPreferredDatesChange(nextDates);
  };

  return (
    <Card className="space-y-6 p-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">First Name</label>
          <Input value={profile.firstName} disabled readOnly />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Last Name</label>
          <Input value={profile.lastName} disabled readOnly />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Email</label>
        <Input value={profile.email} disabled readOnly />
      </div>

      <div className="space-y-2">
        <label htmlFor="contactNumber" className="text-sm font-medium">
          Contact Number
        </label>
        <Input
          id="contactNumber"
          name="contactNumber"
          required
          defaultValue={values.contactNumber}
          placeholder="Enter contact number"
        />
        <FieldError message={fieldErrors.contactNumber} />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Dietary Preference</label>
        <input type="hidden" name="dietaryPreference" value={values.dietaryPreference} />
        <Select
          value={values.dietaryPreference}
          onValueChange={(value) => onDietaryPreferenceChange(value as DietaryPreferenceValue)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select dietary preference" />
          </SelectTrigger>
          <SelectContent>
            {DIETARY_PREFERENCE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FieldError message={fieldErrors.dietaryPreference} />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Previously Certified</label>
        <input type="hidden" name="previouslyCertified" value={values.previouslyCertified} />
        <Select value={values.previouslyCertified} onValueChange={onPreviouslyCertifiedChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select yes or no" />
          </SelectTrigger>
          <SelectContent>
            {CERTIFICATION_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FieldError message={fieldErrors.previouslyCertified} />
      </div>

      <div className="space-y-2">
        <label htmlFor="affiliation" className="text-sm font-medium">
          Mich-CA Affiliation (Club Name)
        </label>
        <Input
          id="affiliation"
          name="affiliation"
          defaultValue={values.affiliation}
          placeholder="Optional"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">Preferred Date</label>
          <div className="space-y-2 rounded-lg border border-border/70 p-3">
            {UMPIRING_DATE_OPTIONS.map((option) => (
              <label key={option.value} className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={values.preferredDates.includes(option.value)}
                  onCheckedChange={() => togglePreferredDate(option.value)}
                />
                <span>{option.label}</span>
                {values.preferredDates.includes(option.value) ? (
                  <input type="hidden" name="preferredDates" value={option.value} />
                ) : null}
              </label>
            ))}
          </div>
          <FieldError message={fieldErrors.preferredDates} />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Preferred Location</label>
          <input type="hidden" name="preferredLocation" value={values.preferredLocation} />
          <Select value={values.preferredLocation} onValueChange={onPreferredLocationChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select location" />
            </SelectTrigger>
            <SelectContent>
              {UMPIRING_LOCATION_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError message={fieldErrors.preferredLocation} />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="questions" className="text-sm font-medium">
          Any Questions?
        </label>
        <Textarea
          id="questions"
          name="questions"
          defaultValue={values.questions}
          placeholder="Please add any dietary restrictions, accessibility needs, or questions you have about the training."
          rows={4}
        />
      </div>
    </Card>
  );
}
