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
          secretaryName: "",
          secretaryEmail: "N/A",
        }}
        fieldErrors={{}}
      />
    );

    expect(screen.getByDisplayValue("Michigan Falcons")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Ava Patel")).toBeInTheDocument();
    expect(screen.getByDisplayValue("ava@example.com")).toBeInTheDocument();
    expect(screen.getByDisplayValue("N/A")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("N/A")).toHaveValue("");
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
        }}
        fieldErrors={{
          clubName: "Club name is required",
          presidentName: "President name is required",
          presidentEmail: "President email is invalid",
          presidentPhoneNumber: "President phone is required",
          secretaryEmail: "Secretary email is invalid",
        }}
      />
    );

    expect(screen.getByText("Club name is required")).toBeInTheDocument();
    expect(screen.getByText("President name is required")).toBeInTheDocument();
    expect(screen.getByText("President email is invalid")).toBeInTheDocument();
    expect(screen.getByText("President phone is required")).toBeInTheDocument();
    expect(screen.getByText("Secretary email is invalid")).toBeInTheDocument();
  });
});
