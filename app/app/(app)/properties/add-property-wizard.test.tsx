/** @vitest-environment jsdom */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { AddPropertyWizard } from "./add-property-wizard";

const { routerMock, useDraftMock, fetchMock, useIsMobileMock } = vi.hoisted(() => {
  return {
    routerMock: {
      push: vi.fn(),
      refresh: vi.fn(),
    },
    useDraftMock: vi.fn(),
    fetchMock: vi.fn(),
    useIsMobileMock: vi.fn(),
  };
});

vi.mock("next/navigation", () => ({
  useRouter: () => routerMock,
}));

vi.mock("@/lib/use-is-mobile", () => ({
  useIsMobile: () => useIsMobileMock(),
}));

vi.mock("../draft-context", () => ({
  useDraft: () => useDraftMock(),
  hasAnyWizardData: (data: { [key: string]: unknown }) =>
    Boolean(
      String(data.addressLine1 ?? "").trim() ||
        String(data.city ?? "").trim() ||
        String(data.state ?? "").trim() ||
        String(data.zipCode ?? "").trim() ||
        String(data.purchasePrice ?? "").trim() ||
        String(data.currentEstimatedValue ?? "").trim() ||
        String(data.currentMonthlyRent ?? "").trim() ||
        String(data.currentMonthlyExpenses ?? "").trim()
    ),
}));

vi.mock("@/components/currency-input", () => ({
  CurrencyInput: ({
    id,
    value,
    onChange,
    required,
    className,
  }: {
    id: string;
    value: string;
    onChange: (value: string) => void;
    required?: boolean;
    className?: string;
  }) => (
    <input
      id={id}
      value={value}
      required={required}
      className={className}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}));

vi.mock("@/components/property/address-autocomplete-input", () => ({
  AddressAutocompleteInput: ({
    id,
    value,
    onValueChange,
    required,
    className,
  }: {
    id: string;
    value: string;
    onValueChange: (value: string) => void;
    required?: boolean;
    className?: string;
  }) => (
    <input
      id={id}
      value={value}
      required={required}
      className={className}
      onChange={(e) => onValueChange(e.target.value)}
    />
  ),
}));

vi.mock("@/components/property/property-square-feet-field", () => ({
  PropertySquareFeetField: ({
    value,
    onChange,
  }: {
    value: string;
    onChange: (value: string) => void;
  }) => (
    <input
      id="squareFeet"
      aria-label="Square feet (optional)"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}));

vi.mock("@/components/rentcast-quota-hint", () => ({
  RentCastQuotaHint: () => null,
}));

function createDraftState(overrides?: Partial<ReturnType<typeof baseDraftState>>) {
  return {
    ...baseDraftState(),
    ...overrides,
  };
}

function baseDraftState() {
  return {
    hasDraft: false,
    draftData: null as
      | null
      | {
          data: Record<string, unknown>;
          savedAt: string;
          currentStep?: number;
        },
    savedAt: null as string | null,
    startFreshKey: 0,
    setHasDraft: vi.fn(),
    saveDraft: vi.fn(),
    clearDraft: vi.fn(),
    navigateTo: vi.fn(),
    registerWizardGetData: vi.fn(),
    registerWizardGetStep: vi.fn(),
  };
}

function defaultFetchResponse(input: string) {
  if (input.startsWith("/api/estimates/value")) {
    return Promise.resolve({
      ok: true,
      json: async () => ({ value: 250000 }),
    });
  }
  if (input.startsWith("/api/estimates/rent")) {
    return Promise.resolve({
      ok: true,
      json: async () => ({ rent: 1800 }),
    });
  }
  if (input.startsWith("/api/properties")) {
    return Promise.resolve({
      ok: true,
      json: async () => ({ id: "prop-1", createdFirstProperty: false }),
    });
  }
  return Promise.resolve({
    ok: true,
    json: async () => ({}),
  });
}

function fillStep1() {
  fireEvent.change(screen.getByLabelText("Address line 1 *"), {
    target: { value: "123 Main St" },
  });
  fireEvent.change(screen.getByLabelText("City *"), {
    target: { value: "Austin" },
  });
  fireEvent.change(screen.getByLabelText("State *"), {
    target: { value: "TX" },
  });
  fireEvent.change(screen.getByLabelText("ZIP *"), {
    target: { value: "78701" },
  });
}

function fillStep2() {
  fireEvent.change(screen.getByLabelText("Purchase price *"), {
    target: { value: "200000" },
  });
  fireEvent.change(screen.getByLabelText("Purchase date *"), {
    target: { value: "2022-01-01" },
  });
  fireEvent.change(screen.getByLabelText("Current estimated value *"), {
    target: { value: "250000" },
  });
}

async function goToStep3WithRequiredData() {
  fillStep1();
  fireEvent.click(screen.getByRole("button", { name: "Next" }));
  await screen.findByRole("heading", { name: "Finances" });
  fillStep2();
  fireEvent.click(screen.getByRole("button", { name: "Next" }));
  await screen.findByRole("heading", { name: "Income" });
}

describe("AddPropertyWizard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useIsMobileMock.mockReturnValue(false);
    useDraftMock.mockReturnValue(createDraftState());
    fetchMock.mockImplementation((input: string) => defaultFetchResponse(input));
    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
      cb(0);
      return 0;
    });
    Element.prototype.scrollIntoView = vi.fn();
    window.scrollTo = vi.fn();
  });

  it("supports forward navigation from Step 1 to Step 2", async () => {
    render(<AddPropertyWizard />);
    fillStep1();
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(await screen.findByRole("heading", { name: "Finances" })).toBeInTheDocument();
  });

  it("preserves data when navigating back and forward across steps", async () => {
    render(<AddPropertyWizard />);
    await goToStep3WithRequiredData();

    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(await screen.findByRole("heading", { name: "Finances" })).toBeInTheDocument();
    expect(screen.getByDisplayValue("200000")).toBeInTheDocument();
    expect(screen.getByDisplayValue("2022-01-01")).toBeInTheDocument();
    expect(screen.getByDisplayValue("250000")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(await screen.findByRole("heading", { name: "Property" })).toBeInTheDocument();
    expect(screen.getByDisplayValue("123 Main St")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Austin")).toBeInTheDocument();
    expect(screen.getByDisplayValue("78701")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    await screen.findByRole("heading", { name: "Finances" });
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(await screen.findByRole("heading", { name: "Income" })).toBeInTheDocument();
  });

  it("blocks invalid Step 1 submission and allows Step 3 empty submission", async () => {
    render(<AddPropertyWizard />);

    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(await screen.findByText("Address is required")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Property" })).toBeInTheDocument();

    await goToStep3WithRequiredData();
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(await screen.findByRole("heading", { name: "Review & create" })).toBeInTheDocument();
  });

  it("deduplicates value estimate calls for same address", async () => {
    render(<AddPropertyWizard />);
    fillStep1();

    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    await screen.findByRole("heading", { name: "Finances" });
    await waitFor(() => {
      const valueCalls = fetchMock.mock.calls.filter(
        ([url]: [string]) => typeof url === "string" && url.startsWith("/api/estimates/value")
      );
      expect(valueCalls).toHaveLength(1);
    });

    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    await screen.findByRole("heading", { name: "Property" });

    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    await screen.findByRole("heading", { name: "Finances" });
    await waitFor(() => {
      const valueCalls = fetchMock.mock.calls.filter(
        ([url]: [string]) => typeof url === "string" && url.startsWith("/api/estimates/value")
      );
      expect(valueCalls).toHaveLength(1);
    });
  });

  it("restores to saved draft step when draft contains currentStep", async () => {
    useDraftMock.mockReturnValue(
      createDraftState({
        draftData: {
          data: {
            addressLine1: "123 Main St",
            city: "Austin",
            state: "TX",
            zipCode: "78701",
            purchasePrice: "200000",
            purchaseDate: "2022-01-01",
            currentEstimatedValue: "250000",
          },
          savedAt: "2026-04-05T10:00:00.000Z",
          currentStep: 3,
        },
      })
    );

    render(<AddPropertyWizard />);
    expect(await screen.findByRole("heading", { name: "Income" })).toBeInTheDocument();
  });

  it("returns to Review after editing from Review via Edit link", async () => {
    render(<AddPropertyWizard />);
    await goToStep3WithRequiredData();
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(await screen.findByRole("heading", { name: "Review & create" })).toBeInTheDocument();

    const editButtons = screen.getAllByRole("button", { name: "Edit" });
    fireEvent.click(editButtons[0]);
    expect(await screen.findByRole("heading", { name: "Property" })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Nickname (optional)"), {
      target: { value: "My Rental" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Next" }));

    expect(await screen.findByRole("heading", { name: "Review & create" })).toBeInTheDocument();
    expect(screen.getByText("My Rental")).toBeInTheDocument();
  });

  it("renders quick-add mode without step wizard navigation", () => {
    render(<AddPropertyWizard quickAdd />);
    expect(screen.getByLabelText("Address *")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create property" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Next" })).not.toBeInTheDocument();
  });

  it("renders mobile shell flow when isMobile is true", async () => {
    useIsMobileMock.mockReturnValue(true);

    render(<AddPropertyWizard />);
    expect(screen.getByRole("heading", { name: "Property" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next" })).toBeInTheDocument();

    fillStep1();
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(await screen.findByRole("heading", { name: "Finances" })).toBeInTheDocument();
  });
});
