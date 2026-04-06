/** @vitest-environment jsdom */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { AddressAutocompleteInput } from "./address-autocomplete-input";

vi.mock("@/lib/analytics-client", () => ({
  captureClientEvent: vi.fn(),
}));

type Deferred<T> = {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (reason?: unknown) => void;
};

function createDeferred<T>(): Deferred<T> {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

async function wait(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

function renderAddressInput(
  overrides?: Partial<{
    onSelect: (address: {
      addressLine1: string;
      city: string;
      state: string;
      zipCode: string;
    }) => void;
  }>
) {
  const onSelect =
    overrides?.onSelect ??
    (() => {
      // no-op
    });

  function TestHarness() {
    const [value, setValue] = useState("");
    return (
      <div>
        <AddressAutocompleteInput
          id="addressLine1"
          value={value}
          onValueChange={setValue}
          onSelect={(address) => {
            setValue(address.addressLine1);
            onSelect(address);
          }}
        />
        <input aria-label="City *" />
      </div>
    );
  }

  return render(<TestHarness />);
}

describe("AddressAutocompleteInput", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    cleanup();
  });

  it("shows suggestions after typing 3+ characters while focused", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        predictions: [{ description: "123 Main St, Austin, TX", placeId: "p1" }],
      }),
    });

    renderAddressInput();
    const addressInput = document.getElementById("addressLine1") as HTMLInputElement;

    fireEvent.focus(addressInput);
    fireEvent.change(addressInput, { target: { value: "123 Main" } });
    await wait(350);

    expect(await screen.findByText("123 Main St, Austin, TX")).toBeInTheDocument();
  });

  it("closes suggestions when focus moves to another input", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        predictions: [{ description: "123 Main St, Austin, TX", placeId: "p1" }],
      }),
    });

    renderAddressInput();
    const addressInput = document.getElementById("addressLine1") as HTMLInputElement;
    const cityInput = screen.getByLabelText("City *");

    fireEvent.focus(addressInput);
    fireEvent.change(addressInput, { target: { value: "123 Main" } });
    await wait(350);
    expect(await screen.findByText("123 Main St, Austin, TX")).toBeInTheDocument();

    fireEvent.blur(addressInput, { relatedTarget: cityInput });
    fireEvent.focus(cityInput);
    await wait(150);

    await waitFor(() => {
      expect(screen.queryByText("123 Main St, Austin, TX")).not.toBeInTheDocument();
    });
  });

  it("stays closed when autocomplete response resolves after blur", async () => {
    const deferredAutocomplete = createDeferred<{
      ok: boolean;
      json: () => Promise<{ predictions: Array<{ description: string; placeId: string }> }>;
    }>();
    fetchMock.mockImplementation(() => deferredAutocomplete.promise);

    renderAddressInput();
    const addressInput = document.getElementById("addressLine1") as HTMLInputElement;
    const cityInput = screen.getByLabelText("City *");

    fireEvent.focus(addressInput);
    fireEvent.change(addressInput, { target: { value: "123 Main" } });
    fireEvent.blur(addressInput, { relatedTarget: cityInput });
    fireEvent.focus(cityInput);
    await wait(450);

    deferredAutocomplete.resolve({
      ok: true,
      json: async () => ({
        predictions: [{ description: "123 Main St, Austin, TX", placeId: "p1" }],
      }),
    });

    await waitFor(() => {
      expect(screen.queryByText("123 Main St, Austin, TX")).not.toBeInTheDocument();
    });
  });

  it("selects a suggestion, autofills value, and closes the list", async () => {
    const onSelect = vi.fn();
    fetchMock.mockImplementation((url: string) => {
      if (url.startsWith("/api/places/autocomplete")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            predictions: [{ description: "123 Main St, Austin, TX", placeId: "p1" }],
          }),
        });
      }

      if (url.startsWith("/api/places/details")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            addressLine1: "123 Main St",
            city: "Austin",
            state: "TX",
            zipCode: "78701",
          }),
        });
      }

      return Promise.resolve({ ok: false, json: async () => ({}) });
    });

    renderAddressInput({ onSelect });
    const addressInput = document.getElementById("addressLine1") as HTMLInputElement;

    fireEvent.focus(addressInput);
    fireEvent.change(addressInput, { target: { value: "123 Main" } });
    await wait(350);

    const option = await screen.findByRole("button", {
      name: "123 Main St, Austin, TX",
    });
    fireEvent.click(option);

    await waitFor(() => {
      expect(onSelect).toHaveBeenCalledWith({
        addressLine1: "123 Main St",
        city: "Austin",
        state: "TX",
        zipCode: "78701",
      });
    });

    expect(document.getElementById("addressLine1")).toHaveValue("123 Main St");
    expect(screen.queryByText("123 Main St, Austin, TX")).not.toBeInTheDocument();
  });
});
