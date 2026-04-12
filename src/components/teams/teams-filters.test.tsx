import { act, fireEvent, render, screen } from "@testing-library/react";

import { TeamsFilters } from "@/components/teams/teams-filters";

const { replaceMock, pathnameMock, searchParamsMock } = vi.hoisted(() => ({
  replaceMock: vi.fn(),
  pathnameMock: "/teams",
  searchParamsMock: new URLSearchParams(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: replaceMock,
  }),
  usePathname: () => pathnameMock,
  useSearchParams: () => searchParamsMock,
}));

describe("TeamsFilters", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    searchParamsMock.forEach((_, key) => searchParamsMock.delete(key));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("does not trigger search updates for a single character", () => {
    render(
      <TeamsFilters initialFormat="all" initialDivision="all" initialSearch="" />
    );

    fireEvent.change(screen.getByPlaceholderText("Search by team name or code"), {
      target: { value: "D" },
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(replaceMock).not.toHaveBeenCalled();
  });

  it("triggers search updates after two characters", () => {
    render(
      <TeamsFilters initialFormat="all" initialDivision="all" initialSearch="" />
    );

    fireEvent.change(screen.getByPlaceholderText("Search by team name or code"), {
      target: { value: "DA" },
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(replaceMock).toHaveBeenCalledWith("/teams?search=DA", {
      scroll: false,
    });
  });

  it("removes division when format changes away from T20", () => {
    searchParamsMock.set("format", "T20");
    searchParamsMock.set("division", "Division-2");

    render(
      <TeamsFilters
        initialFormat="T20"
        initialDivision="Division-2"
        initialSearch=""
      />
    );

    const [formatSelect] = screen.getAllByRole("combobox");
    fireEvent.change(formatSelect, { target: { value: "F40" } });

    expect(replaceMock).toHaveBeenCalledWith("/teams?format=F40", {
      scroll: false,
    });
  });

  it("disables division filtering for non-T20 formats", () => {
    render(
      <TeamsFilters initialFormat="F40" initialDivision="all" initialSearch="" />
    );

    expect(screen.getAllByRole("combobox")[1]).toBeDisabled();
    expect(screen.getByRole("option", { name: "All T20 divisions" })).toBeInTheDocument();
  });
});
