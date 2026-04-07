/** @vitest-environment jsdom */
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MobileBottomNav } from "./mobile-bottom-nav";

const { usePathnameMock } = vi.hoisted(() => ({
  usePathnameMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => usePathnameMock(),
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("MobileBottomNav", () => {
  beforeEach(() => {
    usePathnameMock.mockReset();
  });

  it("highlights active item for nested paths", () => {
    usePathnameMock.mockReturnValue("/properties/abc");
    render(<MobileBottomNav />);

    const properties = screen.getByRole("link", { name: "Properties" });
    const dashboard = screen.getByRole("link", { name: "Dashboard" });

    expect(properties.className).toContain("text-accent");
    expect(properties.className).toContain("font-medium");
    expect(dashboard.className).toContain("text-muted");
  });

  it("dispatches open-mobile-menu event when More is clicked", () => {
    usePathnameMock.mockReturnValue("/dashboard");
    const handler = vi.fn();
    document.addEventListener("open-mobile-menu", handler as EventListener);

    render(<MobileBottomNav />);
    const moreButtons = screen.getAllByRole("button", { name: "More navigation options" });
    fireEvent.click(moreButtons[moreButtons.length - 1]);

    expect(handler).toHaveBeenCalledTimes(1);
    document.removeEventListener("open-mobile-menu", handler as EventListener);
  });
});
