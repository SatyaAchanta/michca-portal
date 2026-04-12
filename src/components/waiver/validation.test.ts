import { parseWaiverForm } from "@/components/waiver/validation";

function createValidFormData() {
  const formData = new FormData();
  formData.set("playerName", "Rohan Patel");
  formData.set("cricclubsId", "CC-12345");
  formData.set("city", "Troy");
  formData.set("address", "123 Main St");
  formData.set("t20Division", "Premier");
  formData.set("t20TeamCode", "T20-MOCC");
  formData.set("secondaryDivision", "T30");
  formData.set("secondaryTeamCode", "T30-MOCC");
  formData.set("signatureName", "Rohan Patel");
  formData.set("submitAcknowledgement", "yes");
  return formData;
}

describe("parseWaiverForm", () => {
  it("parses valid data", () => {
    const result = parseWaiverForm(createValidFormData());

    expect(result.fieldErrors).toEqual({});
    expect(result.data).toEqual({
      playerName: "Rohan Patel",
      cricclubsId: "CC-12345",
      city: "Troy",
      address: "123 Main St",
      t20Division: "Premier",
      t20TeamCode: "T20-MOCC",
      secondaryDivision: "T30",
      secondaryTeamCode: "T30-MOCC",
      signatureName: "Rohan Patel",
      submitAcknowledgement: true,
    });
  });

  it("returns field errors for missing required values", () => {
    const result = parseWaiverForm(new FormData());

    expect(result.data).toBeUndefined();
    expect(result.fieldErrors).toMatchObject({
      playerName: expect.any(String),
      cricclubsId: expect.any(String),
      city: expect.any(String),
      address: expect.any(String),
      t20Division: expect.any(String),
      t20TeamCode: expect.any(String),
      secondaryDivision: expect.any(String),
      secondaryTeamCode: expect.any(String),
      signatureName: expect.any(String),
      submitAcknowledgement: expect.any(String),
    });
  });

  it("requires address", () => {
    const formData = createValidFormData();
    formData.set("address", "");

    const result = parseWaiverForm(formData);

    expect(result.data).toBeUndefined();
    expect(result.fieldErrors.address).toContain("Address is required");
  });

  it("rejects youth as a secondary division", () => {
    const formData = createValidFormData();
    formData.set("secondaryDivision", "YOUTH");

    const result = parseWaiverForm(formData);

    expect(result.data).toBeUndefined();
    expect(result.fieldErrors.secondaryDivision).toContain("F40 or T30");
  });

  it("requires the acknowledgment checkbox", () => {
    const formData = createValidFormData();
    formData.set("submitAcknowledgement", "no");

    const result = parseWaiverForm(formData);

    expect(result.data).toBeUndefined();
    expect(result.fieldErrors.submitAcknowledgement).toContain("must acknowledge");
  });
});
