"use client";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Youth15RegistrationFieldErrors } from "@/components/y15-registration/validation";

type RegistrationValues = {
  clubName: string;
  presidentName: string;
  presidentEmail: string;
  presidentPhoneNumber: string;
  secretaryName: string;
  secretaryEmail: string;
  secretaryPhoneNumber: string;
};

type RegistrationFieldsProps = {
  values: RegistrationValues;
  fieldErrors: Youth15RegistrationFieldErrors;
};

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="text-xs text-destructive">{message}</p>;
}

export function Youth15RegistrationFields({
  values,
  fieldErrors,
}: RegistrationFieldsProps) {
  return (
    <Card className="space-y-6 p-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="clubName" className="text-sm font-medium">
            Club Name
          </label>
          <Input
            id="clubName"
            name="clubName"
            required
            defaultValue={values.clubName}
            placeholder="Enter club name"
          />
          <FieldError message={fieldErrors.clubName} />
        </div>

        <div className="space-y-2">
          <label htmlFor="presidentName" className="text-sm font-medium">
            President Name
          </label>
          <Input
            id="presidentName"
            name="presidentName"
            required
            defaultValue={values.presidentName}
            placeholder="Enter president name"
          />
          <FieldError message={fieldErrors.presidentName} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="presidentEmail" className="text-sm font-medium">
            President Email
          </label>
          <Input
            id="presidentEmail"
            name="presidentEmail"
            type="email"
            required
            defaultValue={values.presidentEmail}
            placeholder="president@club.org"
          />
          <FieldError message={fieldErrors.presidentEmail} />
        </div>

        <div className="space-y-2">
          <label htmlFor="presidentPhoneNumber" className="text-sm font-medium">
            President Phone Number
          </label>
          <Input
            id="presidentPhoneNumber"
            name="presidentPhoneNumber"
            required
            defaultValue={values.presidentPhoneNumber}
            placeholder="Enter phone number"
          />
          <FieldError message={fieldErrors.presidentPhoneNumber} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="secretaryName" className="text-sm font-medium">
            Secretary Name
          </label>
          <Input
            id="secretaryName"
            name="secretaryName"
            required
            defaultValue={values.secretaryName}
            placeholder="Enter secretary name"
          />
          <FieldError message={fieldErrors.secretaryName} />
        </div>
        <div className="space-y-2">
          <label htmlFor="secretaryPhoneNumber" className="text-sm font-medium">
            Secretary Phone Number
          </label>
          <Input
            id="secretaryPhoneNumber"
            name="secretaryPhoneNumber"
            required
            defaultValue={values.secretaryPhoneNumber}
            placeholder="Enter secretary phone number"
          />
          <FieldError message={fieldErrors.secretaryPhoneNumber} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="secretaryEmail" className="text-sm font-medium">
            Secretary Email
          </label>
          <Input
            id="secretaryEmail"
            name="secretaryEmail"
            required
            defaultValue={values.secretaryEmail}
            placeholder="secretary@club.org"
          />
          <FieldError message={fieldErrors.secretaryEmail} />
        </div>
      </div>
    </Card>
  );
}
