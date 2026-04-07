/** @vitest-environment jsdom */
import { describe, expect, it } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { MobileToolShell } from "./mobile-tool-shell";

describe("MobileToolShell", () => {
  it("renders legacy header props, summary items, and children", () => {
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

  it("renders contextBar when provided", () => {
    const { container } = render(
      <MobileToolShell contextBar={<p>Compact context bar</p>} summaryItems={[]}>
        <p>Body</p>
      </MobileToolShell>
    );

    expect(screen.getByText("Compact context bar")).toBeInTheDocument();
    expect(within(container).queryByRole("heading")).not.toBeInTheDocument();
    expect(screen.getByText("Body")).toBeInTheDocument();
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

  it("preserves active mode unless it disappears", () => {
    const { rerender, container } = render(
      <MobileToolShell
        title="Modes"
        modes={[
          { id: "a", label: "Alpha", content: <p>Alpha panel</p> },
          { id: "b", label: "Beta", content: <p>Beta panel</p> },
        ]}
        initialModeId="a"
      />
    );

    const betaButtons = within(container).getAllByRole("button", { name: "Beta" });
    fireEvent.click(betaButtons[betaButtons.length - 1]);
    expect(within(container).getByText("Beta panel")).toBeInTheDocument();

    rerender(
      <MobileToolShell
        title="Modes"
        modes={[
          { id: "b", label: "Beta", content: <p>Beta panel</p> },
          { id: "c", label: "Gamma", content: <p>Gamma panel</p> },
        ]}
        initialModeId="c"
      />
    );

    expect(within(container).getByText("Beta panel")).toBeInTheDocument();

    rerender(
      <MobileToolShell
        title="Modes"
        modes={[{ id: "c", label: "Gamma", content: <p>Gamma panel</p> }]}
        initialModeId="c"
      />
    );

    expect(within(container).getByText("Gamma panel")).toBeInTheDocument();
  });
});
