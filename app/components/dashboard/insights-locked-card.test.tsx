/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { InsightsLockedCard } from "./insights-locked-card";

const { captureClientEventMock } = vi.hoisted(() => ({
  captureClientEventMock: vi.fn(),
}));

vi.mock("@/lib/analytics-client", () => ({
  captureClientEvent: (...args: unknown[]) => captureClientEventMock(...args),
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    onClick,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
    onClick?: () => void;
  }) => (
    <a href={href} onClick={onClick} {...props}>
      {children}
    </a>
  ),
}));

const STORAGE_KEY = "veld:insights-locked-dismissed:v1";

describe("InsightsLockedCard", () => {
  beforeEach(() => {
    captureClientEventMock.mockReset();
    window.localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("renders the section header, tier pill, and CTA by default", () => {
    render(<InsightsLockedCard placement="dashboard_single" />);

    expect(screen.getByText("Portfolio insights")).toBeInTheDocument();
    expect(screen.getByText("Investor & Pro")).toBeInTheDocument();
    const cta = screen.getByRole("link", { name: "Unlock with Investor" });
    expect(cta.getAttribute("href")).toBe(
      "/pricing?placement=dashboard_insights_locked"
    );
  });

  it("uses single-property scope copy on dashboard_single", () => {
    render(<InsightsLockedCard placement="dashboard_single" />);

    expect(
      screen.getByText(/flagged automatically on this property/)
    ).toBeInTheDocument();
  });

  it("uses portfolio scope copy on dashboard_multi", () => {
    render(<InsightsLockedCard placement="dashboard_multi" />);

    expect(
      screen.getByText(/flagged automatically across your portfolio/)
    ).toBeInTheDocument();
  });

  it("uses post-trial copy when postTrial is true", () => {
    render(
      <InsightsLockedCard placement="dashboard_single" postTrial={true} />
    );

    expect(
      screen.getByText(/Your trial surfaced what's working/)
    ).toBeInTheDocument();
  });

  it("fires INSIGHTS_LOCKED_VIEWED once on mount with placement and post_trial", () => {
    render(
      <InsightsLockedCard placement="dashboard_multi" postTrial={true} />
    );

    const viewedCalls = captureClientEventMock.mock.calls.filter(
      (call) => call[0] === "insights_locked_viewed"
    );
    expect(viewedCalls).toHaveLength(1);
    expect(viewedCalls[0][1]).toEqual({
      placement: "dashboard_multi",
      post_trial: true,
    });
  });

  it("hides itself after dismiss and writes to localStorage", () => {
    render(<InsightsLockedCard placement="dashboard_single" />);

    fireEvent.click(screen.getByRole("button", { name: "Not now" }));

    expect(screen.queryByText("Portfolio insights")).not.toBeInTheDocument();
    const stored = window.localStorage.getItem(STORAGE_KEY);
    expect(stored).not.toBeNull();
    expect(JSON.parse(stored!)).toMatchObject({
      dismissedAt: expect.any(String),
    });

    const dismissedCalls = captureClientEventMock.mock.calls.filter(
      (call) => call[0] === "insights_locked_dismissed"
    );
    expect(dismissedCalls).toHaveLength(1);
    expect(dismissedCalls[0][1]).toEqual({
      placement: "dashboard_single",
      post_trial: false,
    });
  });

  it("stays hidden on remount within the 7-day dismissal window", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-15T00:00:00Z"));

    const threeDaysAgo = new Date("2026-04-12T00:00:00Z").toISOString();
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ dismissedAt: threeDaysAgo })
    );

    render(<InsightsLockedCard placement="dashboard_single" />);

    expect(screen.queryByText("Portfolio insights")).not.toBeInTheDocument();
    const viewedCalls = captureClientEventMock.mock.calls.filter(
      (call) => call[0] === "insights_locked_viewed"
    );
    expect(viewedCalls).toHaveLength(0);
  });

  it("re-surfaces once the dismissal is older than 7 days", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-15T00:00:00Z"));

    const eightDaysAgo = new Date("2026-04-06T00:00:00Z").toISOString();
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ dismissedAt: eightDaysAgo })
    );

    render(<InsightsLockedCard placement="dashboard_single" />);

    expect(screen.getByText("Portfolio insights")).toBeInTheDocument();
  });

  it("fires INSIGHTS_LOCKED_CTA_CLICKED when the unlock link is clicked", () => {
    render(<InsightsLockedCard placement="dashboard_single" />);

    fireEvent.click(screen.getByRole("link", { name: "Unlock with Investor" }));

    const ctaCalls = captureClientEventMock.mock.calls.filter(
      (call) => call[0] === "insights_locked_cta_clicked"
    );
    expect(ctaCalls).toHaveLength(1);
    expect(ctaCalls[0][1]).toEqual({
      placement: "dashboard_single",
      post_trial: false,
    });
  });
});
