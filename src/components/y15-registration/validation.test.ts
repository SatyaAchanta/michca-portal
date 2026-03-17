import {
  parseYouth15RegistrationForm,
} from "@/components/y15-registration/validation";

function createValidFormData() {
  const formData = new FormData();
  formData.set("clubName", "Michigan Falcons");
  formData.set("presidentName", "Ava Patel");
  formData.set("presidentEmail", "ava@example.com");
  formData.set("presidentPhoneNumber", "248-555-0101");
  formData.set("secretaryName", "N/A");
  formData.set("secretaryEmail", "secretary@example.com");
  return formData;
}

describe("parseYouth15RegistrationForm", () => {
  it("parses valid data", () => {
    const result = parseYouth15RegistrationForm(createValidFormData());

    expect(result.fieldErrors).toEqual({});
    expect(result.data).toEqual({
      clubName: "Michigan Falcons",
      presidentName: "Ava Patel",
      presidentEmail: "ava@example.com",
      presidentPhoneNumber: "248-555-0101",
      secretaryName: "N/A",
      secretaryEmail: "secretary@example.com",
    });
  });

  it("returns field errors for missing required values", () => {
    const result = parseYouth15RegistrationForm(new FormData());

    expect(result.data).toBeUndefined();
    expect(result.fieldErrors).toMatchObject({
      clubName: expect.any(String),
      presidentName: expect.any(String),
      presidentEmail: expect.any(String),
      presidentPhoneNumber: expect.any(String),
      secretaryEmail: expect.any(String),
    });
  });

  it("accepts an empty secretary name", () => {
    const formData = createValidFormData();
    formData.set("secretaryName", "");

    const result = parseYouth15RegistrationForm(formData);

    expect(result.fieldErrors).toEqual({});
    expect(result.data?.secretaryName).toBeNull();
  });

  it("accepts N/A for secretary email", () => {
    const formData = createValidFormData();
    formData.set("secretaryEmail", "N/A");

    const result = parseYouth15RegistrationForm(formData);

    expect(result.fieldErrors).toEqual({});
    expect(result.data?.secretaryEmail).toBeNull();
  });

  it("rejects invalid email formats", () => {
    const formData = createValidFormData();
    formData.set("presidentEmail", "invalid-email");
    formData.set("secretaryEmail", "also-invalid");

    const result = parseYouth15RegistrationForm(formData);

    expect(result.data).toBeUndefined();
    expect(result.fieldErrors.presidentEmail).toContain("valid email");
    expect(result.fieldErrors.secretaryEmail).toContain("valid email");
  });
});
