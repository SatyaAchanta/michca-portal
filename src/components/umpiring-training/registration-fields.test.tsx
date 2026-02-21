import { render, screen } from "@testing-library/react";

import { RegistrationFields } from "@/components/umpiring-training/registration-fields";

describe("RegistrationFields", () => {
  it("renders immutable profile fields as disabled", () => {
    render(
      <RegistrationFields
        profile={{ firstName: "Jane", lastName: "Doe", email: "jane@example.com" }}
        values={{
          contactNumber: "248-555-0101",
          affiliation: "Warriors",
          preferredDate: "2026-03-28",
          preferredLocation: "Troy",
          previouslyCertified: "yes",
          questions: "Sample question",
        }}
        fieldErrors={{}}
        onPreferredDateChange={() => {}}
        onPreferredLocationChange={() => {}}
        onPreviouslyCertifiedChange={() => {}}
      />
    );

    expect(screen.getByDisplayValue("Jane")).toBeDisabled();
    expect(screen.getByDisplayValue("Doe")).toBeDisabled();
    expect(screen.getByDisplayValue("jane@example.com")).toBeDisabled();
    expect(screen.getByPlaceholderText("Enter contact number")).toHaveValue("248-555-0101");
  });

  it("shows field error messages", () => {
    render(
      <RegistrationFields
        profile={{ firstName: "Jane", lastName: "Doe", email: "jane@example.com" }}
        values={{
          contactNumber: "",
          affiliation: "",
          preferredDate: "",
          preferredLocation: "",
          previouslyCertified: "",
          questions: "",
        }}
        fieldErrors={{
          contactNumber: "Contact is required",
          previouslyCertified: "Select one",
          preferredDate: "Pick a date",
          preferredLocation: "Pick a location",
        }}
        onPreferredDateChange={() => {}}
        onPreferredLocationChange={() => {}}
        onPreviouslyCertifiedChange={() => {}}
      />
    );

    expect(screen.getByText("Contact is required")).toBeInTheDocument();
    expect(screen.getByText("Select one")).toBeInTheDocument();
    expect(screen.getByText("Pick a date")).toBeInTheDocument();
    expect(screen.getByText("Pick a location")).toBeInTheDocument();
  });
});

