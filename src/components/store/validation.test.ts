import {
  formatPriceUsd,
  getImageFiles,
  parseStoreListingForm,
} from "@/components/store/validation";

function createValidFormData() {
  const formData = new FormData();
  formData.set("title", "SS Cricket Bat");
  formData.set("description", "Used for one season, in good condition.");
  formData.set("condition", "USED");
  formData.set("price", "120");
  formData.set("sellerName", "Satya");
  formData.set("sellerPhone", "+1 248-555-0101");
  formData.set("isNegotiable", "on");
  formData.append("images", new File([new Uint8Array([1, 2, 3])], "a.jpg", { type: "image/jpeg" }));
  formData.append("images", new File([new Uint8Array([4, 5, 6])], "b.jpg", { type: "image/jpeg" }));
  return formData;
}

describe("parseStoreListingForm", () => {
  it("parses valid create payload", () => {
    const result = parseStoreListingForm(createValidFormData(), { requireImages: true });

    expect(result.fieldErrors).toEqual({});
    expect(result.data).toMatchObject({
      title: "SS Cricket Bat",
      condition: "USED",
      priceUsdCents: 12000,
      isNegotiable: true,
      sellerName: "Satya",
    });
    expect(result.data?.imageFiles).toHaveLength(2);
  });

  it("rejects when fewer than 2 images on create", () => {
    const formData = createValidFormData();
    const images = getImageFiles(formData);
    formData.delete("images");
    formData.append("images", images[0]);

    const result = parseStoreListingForm(formData, { requireImages: true });

    expect(result.data).toBeUndefined();
    expect(result.fieldErrors.images).toContain("at least 2");
  });

  it("allows edit submission with no new images", () => {
    const formData = createValidFormData();
    formData.delete("images");

    const result = parseStoreListingForm(formData, { requireImages: false });

    expect(result.fieldErrors).toEqual({});
    expect(result.data?.imageFiles).toHaveLength(0);
  });

  it("rejects invalid price and phone", () => {
    const formData = createValidFormData();
    formData.set("price", "abc");
    formData.set("sellerPhone", "badphone");

    const result = parseStoreListingForm(formData, { requireImages: true });

    expect(result.data).toBeUndefined();
    expect(result.fieldErrors.price).toContain("USD amount");
    expect(result.fieldErrors.sellerPhone).toContain("invalid");
  });
});

describe("formatPriceUsd", () => {
  it("formats normal and negotiable prices", () => {
    expect(formatPriceUsd(8000, false)).toBe("$80");
    expect(formatPriceUsd(8000, true)).toContain("Negotiable");
  });
});
