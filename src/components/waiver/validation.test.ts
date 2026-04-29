import { parseWaiverForm } from "@/components/waiver/validation";
import { WAIVER_US_STATES } from "@/lib/waiver-constants";

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
      additionalT20Division: null,
      additionalT20TeamCode: null,
      secondaryDivision: "T30",
      secondaryTeamCode: "T30-MOCC",
      isUnder18: false,
      parentName: "",
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

  it("requires parent name for under-18 submissions", () => {
    const formData = createValidFormData();
    formData.set("isUnder18", "yes");

    const result = parseWaiverForm(formData);

    expect(result.data).toBeUndefined();
    expect(result.fieldErrors.parentName).toContain("Parent's name is required");
  });

  it("parses parent name for valid under-18 submissions", () => {
    const formData = createValidFormData();
    formData.set("isUnder18", "yes");
    formData.set("parentName", "Priya Patel");
    formData.delete("t20Division");
    formData.set("secondaryDivision", "N/A");
    formData.delete("secondaryTeamCode");
    formData.set("under18T20TeamCode1", "T20-MOCC");

    const result = parseWaiverForm(formData);

    expect(result.fieldErrors).toEqual({});
    expect(result.data?.isUnder18).toBe(true);
    expect(result.data?.parentName).toBe("Priya Patel");
    expect(result.data?.t20TeamCode).toBe("T20-MOCC");
    expect(result.data?.additionalT20TeamCode).toBeNull();
    expect(result.data?.signatureName).toBe("Rohan Patel");
  });

  it("still requires the player signature name for under-18 submissions", () => {
    const formData = createValidFormData();
    formData.set("isUnder18", "yes");
    formData.set("parentName", "Priya Patel");
    formData.delete("t20Division");
    formData.set("secondaryDivision", "N/A");
    formData.delete("secondaryTeamCode");
    formData.set("under18T20TeamCode1", "T20-MOCC");
    formData.set("signatureName", "Priya Patel");

    const result = parseWaiverForm(formData);

    expect(result.data).toBeUndefined();
    expect(result.fieldErrors.signatureName).toContain("must exactly match the player name");
  });

  it("requires a primary selection when under-18 chooses two T20 teams", () => {
    const formData = createValidFormData();
    formData.set("isUnder18", "yes");
    formData.set("parentName", "Priya Patel");
    formData.delete("t20Division");
    formData.set("secondaryDivision", "N/A");
    formData.delete("secondaryTeamCode");
    formData.set("under18T20TeamCode1", "T20-MOCC");
    formData.set("under18T20TeamCode2", "T20-CCC");

    const result = parseWaiverForm(formData);

    expect(result.data).toBeUndefined();
    expect(result.fieldErrors.primaryT20TeamCode).toContain("Choose the primary T20 team");
  });

  it("maps two under-18 T20 teams into primary and additional fields", () => {
    const formData = createValidFormData();
    formData.set("isUnder18", "yes");
    formData.set("parentName", "Priya Patel");
    formData.delete("t20Division");
    formData.set("secondaryDivision", "N/A");
    formData.delete("secondaryTeamCode");
    formData.set("under18T20TeamCode1", "T20-MOCC");
    formData.set("under18T20TeamCode2", "T20-CCC");
    formData.set("primaryT20TeamCode", "T20-CCC");

    const result = parseWaiverForm(formData);

    expect(result.fieldErrors).toEqual({});
    expect(result.data?.t20TeamCode).toBe("T20-CCC");
    expect(result.data?.additionalT20TeamCode).toBe("T20-MOCC");
  });
});
