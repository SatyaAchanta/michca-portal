import {
  parseRegistrationForm,
  parseResultValue,
  toIsoDateString,
} from "@/components/umpiring-training/validation";

function createValidFormData() {
  const formData = new FormData();
  formData.set("contactNumber", "248-555-0101");
  formData.set("dietaryPreference", "VEGETARIAN");
  formData.set("previouslyCertified", "yes");
  formData.set("preferredDate", "2026-03-28");
  formData.set("preferredLocation", "Troy");
  formData.set("affiliation", "Falcons");
  formData.set("questions", "Any prep material?");
  return formData;
}

describe("parseRegistrationForm", () => {
  it("parses valid data", () => {
    const result = parseRegistrationForm(createValidFormData());

    expect(result.fieldErrors).toEqual({});
    expect(result.data).toEqual({
      contactNumber: "248-555-0101",
      dietaryPreference: "VEGETARIAN",
      previouslyCertified: true,
      affiliation: "Falcons",
      preferredDate: "2026-03-28",
      preferredLocation: "Troy",
      questions: "Any prep material?",
    });
  });

  it("returns field errors for missing required values", () => {
    const formData = new FormData();
    const result = parseRegistrationForm(formData);

    expect(result.data).toBeUndefined();
    expect(result.fieldErrors).toMatchObject({
      contactNumber: expect.any(String),
      dietaryPreference: expect.any(String),
      previouslyCertified: expect.any(String),
      preferredDate: expect.any(String),
      preferredLocation: expect.any(String),
    });
  });

  it("rejects invalid preferred date and location", () => {
    const formData = createValidFormData();
    formData.set("preferredDate", "2026-03-30");
    formData.set("preferredLocation", "Detroit");

    const result = parseRegistrationForm(formData);

    expect(result.data).toBeUndefined();
    expect(result.fieldErrors.preferredDate).toContain("March 28");
    expect(result.fieldErrors.preferredLocation).toContain("Troy");
  });

  it("rejects invalid dietary preference", () => {
    const formData = createValidFormData();
    formData.set("dietaryPreference", "KETO");

    const result = parseRegistrationForm(formData);

    expect(result.data).toBeUndefined();
    expect(result.fieldErrors.dietaryPreference).toContain("Vegetarian");
  });
});

describe("parseResultValue", () => {
  it("accepts valid result values", () => {
    expect(parseResultValue("PENDING")).toBe("PENDING");
    expect(parseResultValue("PASS")).toBe("PASS");
    expect(parseResultValue("FAIL")).toBe("FAIL");
  });

  it("rejects unknown result values", () => {
    expect(parseResultValue("UNKNOWN")).toBeNull();
  });
});

describe("toIsoDateString", () => {
  it("returns YYYY-MM-DD", () => {
    expect(toIsoDateString(new Date("2026-03-29T12:30:00.000Z"))).toBe("2026-03-29");
  });
});
