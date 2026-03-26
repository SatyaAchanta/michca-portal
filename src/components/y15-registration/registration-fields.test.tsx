import { render, screen } from "@testing-library/react";

import { Youth15RegistrationFields } from "@/components/y15-registration/registration-fields";

describe("Youth15RegistrationFields", () => {
  it("renders existing values and placeholder copy", () => {
    render(
      <Youth15RegistrationFields
        values={{
          clubName: "Michigan Falcons",
          presidentName: "Ava Patel",
          presidentEmail: "ava@example.com",
          presidentPhoneNumber: "248-555-0101",
          secretaryName: "Maya Shah",
          secretaryEmail: "maya@example.com",
          secretaryPhoneNumber: "248-555-0102",
        }}
        fieldErrors={{}}
      />
    );

    expect(screen.getByDisplayValue("Michigan Falcons")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Ava Patel")).toBeInTheDocument();
    expect(screen.getByDisplayValue("ava@example.com")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Maya Shah")).toBeInTheDocument();
    expect(screen.getByDisplayValue("maya@example.com")).toBeInTheDocument();
    expect(screen.getByDisplayValue("248-555-0102")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter secretary name")).toBeRequired();
    expect(screen.getByPlaceholderText("Enter secretary phone number")).toBeRequired();
    expect(screen.getByPlaceholderText("secretary@club.org")).toBeRequired();
  });

  it("shows field errors", () => {
    render(
      <Youth15RegistrationFields
        values={{
          clubName: "",
          presidentName: "",
          presidentEmail: "",
          presidentPhoneNumber: "",
          secretaryName: "",
          secretaryEmail: "",
          secretaryPhoneNumber: "",
        }}
        fieldErrors={{
          clubName: "Club name is required",
          presidentName: "President name is required",
          presidentEmail: "President email is invalid",
          presidentPhoneNumber: "President phone is required",
          secretaryName: "Secretary name is required",
          secretaryEmail: "Secretary email is invalid",
          secretaryPhoneNumber: "Secretary phone is required",
        }}
      />
    );

    expect(screen.getByText("Club name is required")).toBeInTheDocument();
    expect(screen.getByText("President name is required")).toBeInTheDocument();
    expect(screen.getByText("President email is invalid")).toBeInTheDocument();
    expect(screen.getByText("President phone is required")).toBeInTheDocument();
    expect(screen.getByText("Secretary name is required")).toBeInTheDocument();
    expect(screen.getByText("Secretary email is invalid")).toBeInTheDocument();
    expect(screen.getByText("Secretary phone is required")).toBeInTheDocument();
  });
});
