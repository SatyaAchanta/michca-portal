import { parseClubInfoForm } from "@/components/club-info/validation";

function createValidFormData() {
  const formData = new FormData();
  formData.set("captainName", "Rohan Patel");
  formData.set("cricclubsId", "CC-4455");
  formData.set("contactNumber", "248-555-0101");
  formData.set("t20Division", "Premier");
  formData.set("t20TeamCode", "T20-MOCC");
  formData.set("secondaryDivision", "T30");
  formData.set("secondaryTeamCode", "T30-MOCC");
  return formData;
}

describe("parseClubInfoForm", () => {
  it("parses valid data", () => {
    const result = parseClubInfoForm(createValidFormData());

    expect(result.fieldErrors).toEqual({});
    expect(result.data).toEqual({
      captainName: "Rohan Patel",
      cricclubsId: "CC-4455",
      contactNumber: "248-555-0101",
      t20Division: "Premier",
      t20TeamCode: "T20-MOCC",
      secondaryDivision: "T30",
      secondaryTeamCode: "T30-MOCC",
    });
  });

  it("returns field errors for missing required values", () => {
    const result = parseClubInfoForm(new FormData());

    expect(result.data).toBeUndefined();
    expect(result.fieldErrors).toMatchObject({
      captainName: expect.any(String),
      cricclubsId: expect.any(String),
      contactNumber: expect.any(String),
    });
  });

  it("rejects invalid contact numbers", () => {
    const formData = createValidFormData();
    formData.set("contactNumber", "123");

    const result = parseClubInfoForm(formData);

    expect(result.data).toBeUndefined();
    expect(result.fieldErrors.contactNumber).toContain("valid");
  });

  it("rejects invalid secondary divisions", () => {
    const formData = createValidFormData();
    formData.set("secondaryDivision", "YOUTH");

    const result = parseClubInfoForm(formData);

    expect(result.data).toBeUndefined();
    expect(result.fieldErrors.secondaryDivision).toContain("F40 or T30");
  });

  it("requires at least one team selection", () => {
    const formData = createValidFormData();
    formData.set("t20Division", "N/A");
    formData.set("t20TeamCode", "");
    formData.set("secondaryDivision", "N/A");
    formData.set("secondaryTeamCode", "");

    const result = parseClubInfoForm(formData);

    expect(result.data).toBeUndefined();
    expect(result.fieldErrors.form).toContain("At least one");
  });
});
