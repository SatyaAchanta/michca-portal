import { parseWaiverForm } from "@/components/waiver/validation";
import {
  WAIVER_ROLE_OPTIONS,
  WAIVER_US_STATES,
} from "@/lib/waiver-constants";

function createValidFormData() {
  const formData = new FormData();
  formData.set("playerName", "Rohan Patel");
  formData.set("cricclubsId", "CC-12345");
  formData.set("state", WAIVER_US_STATES[0]);
  formData.set("city", "Troy");
  formData.set("address", "123 Main St");
  formData.set("t20Division", "Premier");
  formData.set("t20TeamCode", "T20-MOCC");
  formData.set("secondaryDivision", "T30");
  formData.set("secondaryTeamCode", "T30-MOCC");
  formData.set("role", WAIVER_ROLE_OPTIONS[0]);
  formData.set("signatureName", "Rohan Patel");
  formData.set("submitAcknowledgement", "yes");
  formData.set("rulebookAcknowledgement", "yes");
  return formData;
}

describe("parseWaiverForm", () => {
  it("parses valid data", () => {
    const result = parseWaiverForm(createValidFormData());

    expect(result.fieldErrors).toEqual({});
    expect(result.data).toEqual({
      playerName: "Rohan Patel",
      cricclubsId: "CC-12345",
      state: WAIVER_US_STATES[0],
      city: "Troy",
      address: "123 Main St",
      t20Division: "Premier",
      t20TeamCode: "T20-MOCC",
      secondaryDivision: "T30",
      secondaryTeamCode: "T30-MOCC",
      role: WAIVER_ROLE_OPTIONS[0],
      signatureName: "Rohan Patel",
      submitAcknowledgement: true,
      rulebookAcknowledgement: true,
    });
  });

  it("returns field errors for missing required values", () => {
    const result = parseWaiverForm(new FormData());

    expect(result.data).toBeUndefined();
    expect(result.fieldErrors).toMatchObject({
      playerName: expect.any(String),
      cricclubsId: expect.any(String),
      state: expect.any(String),
      city: expect.any(String),
      address: expect.any(String),
      t20Division: expect.any(String),
      secondaryDivision: expect.any(String),
      role: expect.any(String),
      signatureName: expect.any(String),
      submitAcknowledgement: expect.any(String),
      rulebookAcknowledgement: expect.any(String),
    });
  });

  it("requires address", () => {
    const formData = createValidFormData();
    formData.set("address", "");

    const result = parseWaiverForm(formData);

    expect(result.data).toBeUndefined();
    expect(result.fieldErrors.address).toContain("Address is required");
  });

  it("requires state", () => {
    const formData = createValidFormData();
    formData.set("state", "");

    const result = parseWaiverForm(formData);

    expect(result.data).toBeUndefined();
    expect(result.fieldErrors.state).toContain("State is required");
  });

  it("requires role", () => {
    const formData = createValidFormData();
    formData.set("role", "");

    const result = parseWaiverForm(formData);

    expect(result.data).toBeUndefined();
    expect(result.fieldErrors.role).toContain("Role is required");
  });

  it("rejects youth as a secondary division", () => {
    const formData = createValidFormData();
    formData.set("secondaryDivision", "YOUTH");

    const result = parseWaiverForm(formData);

    expect(result.data).toBeUndefined();
    expect(result.fieldErrors.secondaryDivision).toContain("F40 or T30");
  });

  it("rejects invalid role values", () => {
    const formData = createValidFormData();
    formData.set("role", "Captain");

    const result = parseWaiverForm(formData);

    expect(result.data).toBeUndefined();
    expect(result.fieldErrors.role).toContain("valid playing role");
  });

  it("requires the acknowledgment checkbox", () => {
    const formData = createValidFormData();
    formData.set("submitAcknowledgement", "no");

    const result = parseWaiverForm(formData);

    expect(result.data).toBeUndefined();
    expect(result.fieldErrors.submitAcknowledgement).toContain("must acknowledge");
  });

  it("requires the rulebook acknowledgment checkbox", () => {
    const formData = createValidFormData();
    formData.set("rulebookAcknowledgement", "no");

    const result = parseWaiverForm(formData);

    expect(result.data).toBeUndefined();
    expect(result.fieldErrors.rulebookAcknowledgement).toContain("rulebook");
  });

  it("requires both acknowledgments independently", () => {
    const formData = createValidFormData();
    formData.set("submitAcknowledgement", "no");
    formData.set("rulebookAcknowledgement", "no");

    const result = parseWaiverForm(formData);

    expect(result.data).toBeUndefined();
    expect(result.fieldErrors.submitAcknowledgement).toBeTruthy();
    expect(result.fieldErrors.rulebookAcknowledgement).toBeTruthy();
  });
});
