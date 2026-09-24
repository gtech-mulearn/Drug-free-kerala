import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { LookupDialog } from "./lookup-dialog";

vi.mock("../actions", () => ({ lookupCertificate: vi.fn() }));

describe("LookupDialog", () => {
  it("is a compact, single-column dialog with its own name", () => {
    render(<LookupDialog open onOpenChange={vi.fn()} onTakePledge={vi.fn()} />);
    const dialog = screen.getByRole("dialog", { name: "Find your certificate" });
    expect(dialog).toBeInTheDocument();
    expect(screen.queryByRole("list", { name: "Pledge steps" })).toBeNull();
    expect(screen.getByLabelText("Name you pledged with")).toBeInTheDocument();
  });

  it("sends people who haven't pledged yet to the pledge form", async () => {
    const user = userEvent.setup();
    const onTakePledge = vi.fn();
    render(<LookupDialog open onOpenChange={vi.fn()} onTakePledge={onTakePledge} />);
    await user.click(screen.getByRole("button", { name: "Take the pledge" }));
    expect(onTakePledge).toHaveBeenCalled();
  });
});
