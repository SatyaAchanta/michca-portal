"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  INITIAL_STORE_LISTING_FORM_STATE,
  STORE_CONDITION_OPTIONS,
  type StoreListingFormState,
} from "@/components/store/validation";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type ListingFormDefaults = {
  title: string;
  description: string;
  condition: "NEW" | "USED";
  price: string;
  isNegotiable: boolean;
  sellerName: string;
  sellerPhone: string;
};

type ListingFormProps = {
  defaults?: ListingFormDefaults;
  submitLabel: string;
  action: (
    prevState: StoreListingFormState,
    formData: FormData
  ) => Promise<StoreListingFormState>;
  currentImageCount?: number;
};

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? "Saving..." : label}
    </Button>
  );
}

export function ListingForm({ defaults, submitLabel, action, currentImageCount }: ListingFormProps) {
  const [state, formAction] = useActionState<StoreListingFormState, FormData>(
    action,
    INITIAL_STORE_LISTING_FORM_STATE
  );

  return (
    <form action={formAction} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <label className="text-sm font-medium" htmlFor="title">
            Title
          </label>
          <Input id="title" name="title" defaultValue={defaults?.title ?? ""} maxLength={120} required />
          {state.fieldErrors.title ? <p className="text-xs text-destructive">{state.fieldErrors.title}</p> : null}
        </div>

        <div className="space-y-2 sm:col-span-2">
          <label className="text-sm font-medium" htmlFor="description">
            Description
          </label>
          <Textarea
            id="description"
            name="description"
            defaultValue={defaults?.description ?? ""}
            rows={6}
            maxLength={2000}
            required
          />
          {state.fieldErrors.description ? (
            <p className="text-xs text-destructive">{state.fieldErrors.description}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Condition</label>
          <Select name="condition" defaultValue={defaults?.condition ?? "USED"}>
            <SelectTrigger>
              <SelectValue placeholder="Select condition" />
            </SelectTrigger>
            <SelectContent>
              {STORE_CONDITION_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {state.fieldErrors.condition ? <p className="text-xs text-destructive">{state.fieldErrors.condition}</p> : null}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="price">
            Price (USD)
          </label>
          <Input id="price" name="price" type="text" inputMode="decimal" defaultValue={defaults?.price ?? ""} required />
          {state.fieldErrors.price ? <p className="text-xs text-destructive">{state.fieldErrors.price}</p> : null}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="sellerName">
            Seller Name
          </label>
          <Input
            id="sellerName"
            name="sellerName"
            defaultValue={defaults?.sellerName ?? ""}
            maxLength={80}
            required
          />
          {state.fieldErrors.sellerName ? (
            <p className="text-xs text-destructive">{state.fieldErrors.sellerName}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="sellerPhone">
            Phone Number
          </label>
          <Input
            id="sellerPhone"
            name="sellerPhone"
            defaultValue={defaults?.sellerPhone ?? ""}
            maxLength={20}
            required
          />
          {state.fieldErrors.sellerPhone ? (
            <p className="text-xs text-destructive">{state.fieldErrors.sellerPhone}</p>
          ) : null}
        </div>

        <div className="space-y-3 sm:col-span-2">
          <label className="text-sm font-medium" htmlFor="images">
            Photos (2-6)
          </label>
          <Input id="images" name="images" type="file" accept="image/*" multiple />
          {currentImageCount !== undefined ? (
            <p className="text-xs text-muted-foreground">
              Current photos: {currentImageCount}. Upload new photos to replace existing images.
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">Upload at least 2 photos. Max 6 photos.</p>
          )}
          {state.fieldErrors.images ? <p className="text-xs text-destructive">{state.fieldErrors.images}</p> : null}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Checkbox id="isNegotiable" name="isNegotiable" defaultChecked={defaults?.isNegotiable ?? false} />
        <label htmlFor="isNegotiable" className="text-sm text-muted-foreground">
          Price is negotiable
        </label>
      </div>

      {state.fieldErrors.form ? <p className="text-sm text-destructive">{state.fieldErrors.form}</p> : null}
      {state.message ? (
        <p className={`text-sm ${state.status === "success" ? "text-green-700 dark:text-green-300" : "text-destructive"}`}>
          {state.message}
        </p>
      ) : null}

      <SubmitButton label={submitLabel} />
    </form>
  );
}
