import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PLEDGE_STATEMENT_IDS, PLEDGE_STATEMENTS } from "../content";
import type { PledgeState } from "../types";
import { PledgeDialog } from "./pledge-dialog";

const mocks = vi.hoisted(() => ({ submitPledge: vi.fn() }));

vi.mock("../actions", () => ({ submitPledge: mocks.submitPledge }));

// The canvas renderer is covered by the e2e suite.
vi.mock("@/features/certificate/components/certificate-view", () => ({
  CertificateView: ({ certificate }: { certificate: { name: string; certificateId: string } }) => (
    <p>
      Certificate for {certificate.name} ({certificate.certificateId})
    </p>
  ),
}));

const onFindCertificate = vi.fn();

function renderDialog() {
  const user = userEvent.setup();
  render(<PledgeDialog open onOpenChange={vi.fn()} onFindCertificate={onFindCertificate} />);
  return { user, dialog: screen.getByRole("dialog", { name: "Join the Movement" }) };
}

async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("Your name"), "Anjali Nair");
  await user.type(screen.getByLabelText("Email"), "anjali@example.com");
  for (const id of PLEDGE_STATEMENT_IDS) await user.click(screen.getByLabelText(PLEDGE_STATEMENTS[id]));
}

const respondWith = (state: PledgeState) => mocks.submitPledge.mockResolvedValue(state);

beforeEach(() => {
  respondWith({ status: "created", certificateId: "DKFC00042", name: "Anjali Nair" });
});

describe("PledgeDialog", () => {
  it("validates in the browser with the server's messages before submitting", async () => {
    const { user } = renderDialog();
    await user.click(await screen.findByRole("button", { name: "Take the Pledge" }));

    expect(screen.getByLabelText("Your name")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText("Your name")).toHaveFocus();
    expect(screen.getByText("Accept every pledge statement to continue.")).toBeInTheDocument();
    expect(mocks.submitPledge).not.toHaveBeenCalled();
  });

  it("submits name, email and all statements", async () => {
    const { user } = renderDialog();
    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: "Take the Pledge" }));

    await waitFor(() => expect(mocks.submitPledge).toHaveBeenCalledTimes(1));
    const data = mocks.submitPledge.mock.calls[0]?.[1] as FormData;
    expect(data.get("name")).toBe("Anjali Nair");
    expect(data.get("email")).toBe("anjali@example.com");
    expect(data.getAll("statements")).toEqual([...PLEDGE_STATEMENT_IDS]);
  });

  it("shows the certificate id, then the certificate", async () => {
    const { user } = renderDialog();
    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: "Take the Pledge" }));

    expect(await screen.findByRole("heading", { name: "Pledge successful!" })).toBeInTheDocument();
    expect(screen.getByText("DKFC00042")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "View certificate" }));
    expect(screen.getByText("Certificate for Anjali Nair (DKFC00042)")).toBeInTheDocument();
  });

  it("offers the lookup instead of revealing anything when the email is taken", async () => {
    respondWith({ status: "email_taken" });
    const { user, dialog } = renderDialog();
    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: "Take the Pledge" }));

    const alert = await within(dialog).findByRole("alert");
    expect(alert).toHaveTextContent("already been used");
    await user.click(within(alert).getByRole("button", { name: "find your certificate" }));
    expect(onFindCertificate).toHaveBeenCalled();
  });

  it("walks the step cards through pledge → certificate → share", async () => {
    const { user } = renderDialog();
    const steps = () => within(screen.getByRole("list", { name: "Pledge steps" })).getAllByRole("listitem");
    const current = () => steps().find((step) => step.getAttribute("aria-current") === "step")?.textContent;

    expect(current()).toContain("Take the pledge");
    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: "Take the Pledge" }));
    await screen.findByRole("heading", { name: "Pledge successful!" });
    expect(current()).toContain("Get your certificate");

    await user.click(screen.getByRole("button", { name: "View certificate" }));
    expect(current()).toContain("Share it");
  });

  it("links people who already pledged to the certificate finder", async () => {
    const { user } = renderDialog();
    await user.click(screen.getByRole("button", { name: "Find your certificate" }));
    expect(onFindCertificate).toHaveBeenCalled();
  });

  it("explains rate limiting in minutes", async () => {
    respondWith({ status: "rate_limited", retryAfterSeconds: 290 });
    const { user } = renderDialog();
    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: "Take the Pledge" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("try again in 5 minutes");
  });

  it("cannot be double-submitted while a request is in flight", async () => {
    mocks.submitPledge.mockReturnValue(new Promise(() => {}));
    const { user } = renderDialog();
    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: "Take the Pledge" }));

    const button = await screen.findByRole("button", { name: /Submitting/ });
    expect(button).toBeDisabled();
    await user.click(button);
    expect(mocks.submitPledge).toHaveBeenCalledTimes(1);
  });
});
