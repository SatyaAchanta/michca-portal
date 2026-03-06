export const STORE_CONDITION_OPTIONS = [
  { value: "NEW", label: "New" },
  { value: "USED", label: "Used" },
] as const;

export type StoreConditionValue = (typeof STORE_CONDITION_OPTIONS)[number]["value"];

export const MAX_STORE_IMAGES = 6;
export const MIN_STORE_IMAGES = 2;
export const MAX_STORE_IMAGE_BYTES = 10 * 1024 * 1024;

export type StoreListingFieldErrors = Partial<
  Record<
    | "title"
    | "description"
    | "condition"
    | "price"
    | "sellerName"
    | "sellerPhone"
    | "images"
    | "form",
    string
  >
>;

export type StoreListingFormState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors: StoreListingFieldErrors;
};

export const INITIAL_STORE_LISTING_FORM_STATE: StoreListingFormState = {
  status: "idle",
  fieldErrors: {},
};

export type ParsedStoreListingInput = {
  title: string;
  description: string;
  condition: StoreConditionValue;
  priceUsdCents: number;
  isNegotiable: boolean;
  sellerName: string;
  sellerPhone: string;
  imageFiles: File[];
};

function normalizeText(input: FormDataEntryValue | null) {
  if (typeof input !== "string") {
    return "";
  }
  return input.trim();
}

function parsePriceToCents(rawPrice: string) {
  if (!/^\d+(\.\d{1,2})?$/.test(rawPrice)) {
    return null;
  }

  const dollars = Number.parseFloat(rawPrice);
  if (!Number.isFinite(dollars) || dollars <= 0) {
    return null;
  }

  return Math.round(dollars * 100);
}

export function getImageFiles(formData: FormData) {
  return formData
    .getAll("images")
    .filter((entry): entry is File => entry instanceof File)
    .filter((file) => file.size > 0);
}

export function parseStoreListingForm(
  formData: FormData,
  options: { requireImages: boolean }
): { data?: ParsedStoreListingInput; fieldErrors: StoreListingFieldErrors } {
  const fieldErrors: StoreListingFieldErrors = {};

  const title = normalizeText(formData.get("title"));
  const description = normalizeText(formData.get("description"));
  const conditionRaw = normalizeText(formData.get("condition"));
  const priceRaw = normalizeText(formData.get("price"));
  const sellerName = normalizeText(formData.get("sellerName"));
  const sellerPhone = normalizeText(formData.get("sellerPhone"));
  const imageFiles = getImageFiles(formData);

  if (!title) {
    fieldErrors.title = "Title is required.";
  } else if (title.length > 120) {
    fieldErrors.title = "Title must be at most 120 characters.";
  }

  if (!description) {
    fieldErrors.description = "Description is required.";
  } else if (description.length > 2000) {
    fieldErrors.description = "Description must be at most 2000 characters.";
  }

  let condition: StoreConditionValue | undefined;
  if (!conditionRaw) {
    fieldErrors.condition = "Condition is required.";
  } else if (STORE_CONDITION_OPTIONS.some((option) => option.value === conditionRaw)) {
    condition = conditionRaw as StoreConditionValue;
  } else {
    fieldErrors.condition = "Condition must be New or Used.";
  }

  const priceUsdCents = parsePriceToCents(priceRaw);
  if (priceUsdCents === null) {
    fieldErrors.price = "Price must be a valid USD amount greater than 0.";
  }

  if (!sellerName) {
    fieldErrors.sellerName = "Seller name is required.";
  } else if (sellerName.length > 80) {
    fieldErrors.sellerName = "Seller name must be at most 80 characters.";
  }

  if (!sellerPhone) {
    fieldErrors.sellerPhone = "Phone number is required.";
  } else if (!/^[+()\-\s0-9]{7,20}$/.test(sellerPhone)) {
    fieldErrors.sellerPhone = "Phone number format is invalid.";
  }

  if (options.requireImages) {
    if (imageFiles.length < MIN_STORE_IMAGES) {
      fieldErrors.images = `Upload at least ${MIN_STORE_IMAGES} images.`;
    }
  }

  if (imageFiles.length > MAX_STORE_IMAGES) {
    fieldErrors.images = `You can upload up to ${MAX_STORE_IMAGES} images.`;
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  return {
    fieldErrors: {},
    data: {
      title,
      description,
      condition: condition as StoreConditionValue,
      priceUsdCents: priceUsdCents as number,
      isNegotiable: formData.get("isNegotiable") === "on",
      sellerName,
      sellerPhone,
      imageFiles,
    },
  };
}

export function formatPriceUsd(cents: number, isNegotiable: boolean) {
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);

  return isNegotiable ? `${formatted} (Negotiable)` : formatted;
}
