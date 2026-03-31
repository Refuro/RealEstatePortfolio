/** @vitest-environment jsdom */
import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MobileToolShell } from "./mobile-tool-shell";

describe("MobileToolShell", () => {
  it("renders eyebrow, title, optional description, context, summary items, and children", () => {
    const { container } = render(
      <MobileToolShell
        eyebrow="Workspace"
        title="Modeling"
        description="Optional blurb."
        context={<p>Property context here</p>}
        summaryItems={[
          { label: "Equity", value: "$100" },
          { label: "Debt", value: "$50" },
        ]}
      >
        <p>Main body</p>
      </MobileToolShell>
    );

    expect(screen.getByText("Workspace")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Modeling" })).toBeInTheDocument();
    expect(screen.getByText("Optional blurb.")).toBeInTheDocument();
    expect(screen.getByText("Property context here")).toBeInTheDocument();
    expect(screen.getByText("Equity")).toBeInTheDocument();
    expect(screen.getByText("$100")).toBeInTheDocument();
    expect(screen.getByText("Main body")).toBeInTheDocument();

    const root = container.firstElementChild;
    expect(root).toHaveClass("md:hidden");
  });

  it("renders footer when provided", () => {
    render(
      <MobileToolShell title="T" footer={<button type="button">Save</button>}>
        <span>Content</span>
      </MobileToolShell>
    );
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  });

  it("uses modes and MobileModeSwitcher when modes are set and children are absent", () => {
    render(
      <MobileToolShell
        title="Tabs"
        modes={[
          { id: "a", label: "Alpha", content: <p>Alpha panel</p> },
          { id: "b", label: "Beta", content: <p>Beta panel</p> },
        ]}
        initialModeId="a"
      />
    );

    expect(screen.getByText("Alpha panel")).toBeInTheDocument();
    expect(screen.queryByText("Beta panel")).not.toBeInTheDocument();

    const switcher = screen.getByRole("button", { name: "Beta" });
    fireEvent.click(switcher);

    expect(screen.queryByText("Alpha panel")).not.toBeInTheDocument();
    expect(screen.getByText("Beta panel")).toBeInTheDocument();
  });

  it("prefers children over modes when both are provided", () => {
    render(
      <MobileToolShell
        title="Both"
        modes={[{ id: "x", label: "Mode", content: <p>Mode body</p> }]}
      >
        <p>Child wins</p>
      </MobileToolShell>
    );
    expect(screen.getByText("Child wins")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Mode" })).not.toBeInTheDocument();
  });
});
