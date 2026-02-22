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
          preferredDates: ["MARCH_28_2026"],
          preferredLocation: "Troy",
          dietaryPreference: "VEGETARIAN",
          previouslyCertified: "yes",
          questions: "Sample question",
        }}
        fieldErrors={{}}
        onPreferredDatesChange={() => {}}
        onPreferredLocationChange={() => {}}
        onDietaryPreferenceChange={() => {}}
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
          preferredDates: [],
          preferredLocation: "",
          dietaryPreference: "",
          previouslyCertified: "",
          questions: "",
        }}
        fieldErrors={{
          contactNumber: "Contact is required",
          dietaryPreference: "Choose dietary",
          previouslyCertified: "Select one",
          preferredDates: "Pick dates",
          preferredLocation: "Pick a location",
        }}
        onPreferredDatesChange={() => {}}
        onPreferredLocationChange={() => {}}
        onDietaryPreferenceChange={() => {}}
        onPreviouslyCertifiedChange={() => {}}
      />
    );

    expect(screen.getByText("Contact is required")).toBeInTheDocument();
    expect(screen.getByText("Choose dietary")).toBeInTheDocument();
    expect(screen.getByText("Select one")).toBeInTheDocument();
    expect(screen.getByText("Pick dates")).toBeInTheDocument();
    expect(screen.getByText("Pick a location")).toBeInTheDocument();
  });
});
