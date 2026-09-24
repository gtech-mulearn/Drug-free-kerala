import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { siteConfig } from "@/config/site";
import { MobileNav } from "./mobile-nav";

const { openDialog } = vi.hoisted(() => ({ openDialog: vi.fn() }));
vi.mock("@/features/pledge/components/pledge-dialog-provider", () => ({ usePledgeDialog: () => ({ openDialog }) }));

describe("MobileNav", () => {
  it("opens an accessible menu with every section link", async () => {
    const user = userEvent.setup();
    render(<MobileNav />);

    await user.click(screen.getByRole("button", { name: "Open menu" }));

    const menu = screen.getByRole("dialog", { name: "Menu" });
    const nav = within(menu).getByRole("navigation", { name: "Main" });
    expect(within(nav).getAllByRole("link").map((link) => link.getAttribute("href"))).toEqual(
      siteConfig.nav.map((item) => item.href),
    );
    expect(within(menu).getByRole("button", { name: "Close menu" })).toBeInTheDocument();
  });

  it.each([
    ["Take the pledge", "pledge"],
    ["Find my certificate", "lookup"],
  ])("closes the menu before opening %s", async (label, dialog) => {
    const user = userEvent.setup();
    render(<MobileNav />);
    await user.click(screen.getByRole("button", { name: "Open menu" }));
    await user.click(screen.getByRole("button", { name: label }));

    await waitFor(() => expect(screen.queryByRole("dialog", { name: "Menu" })).not.toBeInTheDocument());
    expect(openDialog).toHaveBeenCalledWith(dialog);
  });
});
