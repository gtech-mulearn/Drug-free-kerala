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
    let settle: (state: PledgeState) => void = () => {};
    mocks.submitPledge.mockReturnValue(new Promise((resolve) => (settle = resolve)));
    const { user } = renderDialog();
    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: "Take the Pledge" }));

    const button = await screen.findByRole("button", { name: /Submitting/ });
    expect(button).toBeDisabled();
    await user.click(button);
    expect(mocks.submitPledge).toHaveBeenCalledTimes(1);

    // React entangles pending async transitions: an action left pending
    // would hold back every later test's action results.
    settle({ status: "error" });
    expect(await screen.findByRole("alert")).toBeInTheDocument();
  });

  describe("student and college", () => {
    const COLLEGES = [
      { id: "11111111-1111-4111-8111-111111111111", title: "GOVERNMENT COLLEGE NEDUMANGAD" },
      { id: "22222222-2222-4222-8222-222222222222", title: "GOVERNMENT POLYTECHNIC COLLEGE NEDUMANGAD" },
      { id: "33333333-3333-4333-8333-333333333333", title: "GOVT.ITI VAYALAR" },
      { id: "44444444-4444-4444-8444-444444444444", title: "ST THOMAS COLLEGE RANNY" },
    ];
    const fetchMock = vi.fn<typeof fetch>();
    const serveColleges = (colleges = COLLEGES) =>
      fetchMock.mockResolvedValue(Response.json({ colleges }, { headers: { "Cache-Control": "public" } }));

    const studentBox = () => screen.getByRole("checkbox", { name: "Are you a student?" });
    const picker = () => screen.getByRole("combobox", { name: "College or school" });
    const submitted = () => mocks.submitPledge.mock.calls[0]?.[1] as FormData;

    async function becomeStudent(user: ReturnType<typeof userEvent.setup>) {
      await user.click(studentBox());
      await waitFor(() => expect(picker()).not.toHaveAttribute("aria-busy", "true"));
    }

    beforeEach(() => {
      vi.stubGlobal("fetch", fetchMock);
      serveColleges();
    });

    it("asks for a college only from students, and loads the list only then", async () => {
      const { user } = renderDialog();
      expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
      expect(fetchMock).not.toHaveBeenCalled();

      await becomeStudent(user);
      expect(fetchMock).toHaveBeenCalledWith("/api/colleges");

      await user.click(studentBox());
      expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    });

    it("sends no college fields from someone who is not a student", async () => {
      const { user } = renderDialog();
      await fillValidForm(user);
      await user.click(screen.getByRole("button", { name: "Take the Pledge" }));

      await waitFor(() => expect(mocks.submitPledge).toHaveBeenCalledTimes(1));
      expect([...submitted().keys()].filter((key) => key !== "statements")).toEqual(["name", "email"]);
    });

    it("searches the list and submits the chosen college's id", async () => {
      const { user } = renderDialog();
      await fillValidForm(user);
      await becomeStudent(user);

      await user.type(picker(), "nedumangad gov");
      expect(picker()).toHaveAttribute("aria-expanded", "true");
      const listbox = screen.getByRole("listbox");
      expect(picker()).toHaveAttribute("aria-controls", listbox.id);
      expect(within(listbox).getAllByRole("option").map((option) => option.textContent)).toEqual([
        "GOVERNMENT COLLEGE NEDUMANGAD",
        "GOVERNMENT POLYTECHNIC COLLEGE NEDUMANGAD",
        "Other (not listed)",
      ]);

      await user.click(screen.getByRole("option", { name: "GOVERNMENT POLYTECHNIC COLLEGE NEDUMANGAD" }));
      expect(picker()).toHaveValue("GOVERNMENT POLYTECHNIC COLLEGE NEDUMANGAD");
      expect(picker()).toHaveAttribute("aria-expanded", "false");

      await user.click(screen.getByRole("button", { name: "Take the Pledge" }));
      await waitFor(() => expect(mocks.submitPledge).toHaveBeenCalledTimes(1));
      expect(submitted().get("is_student")).toBe("on");
      expect(submitted().get("college_id")).toBe(COLLEGES[1]?.id);
      expect(submitted().get("college_other")).toBeNull();
    });

    it("can be driven from the keyboard without submitting the form", async () => {
      const { user } = renderDialog();
      await becomeStudent(user);

      await user.type(picker(), "college");
      const active = () => document.getElementById(picker().getAttribute("aria-activedescendant") ?? "");
      expect(active()).toHaveTextContent("GOVERNMENT COLLEGE NEDUMANGAD");
      expect(active()).toHaveAttribute("aria-selected", "true");

      await user.keyboard("{ArrowDown}{ArrowDown}{ArrowUp}{ArrowDown}");
      expect(active()).toHaveTextContent("ST THOMAS COLLEGE RANNY");

      await user.keyboard("{Enter}");
      expect(picker()).toHaveValue("ST THOMAS COLLEGE RANNY");
      expect(mocks.submitPledge).not.toHaveBeenCalled();
    });

    it("closes the list on Escape without closing the dialog", async () => {
      const onOpenChange = vi.fn();
      const user = userEvent.setup();
      render(<PledgeDialog open onOpenChange={onOpenChange} onFindCertificate={onFindCertificate} />);
      await becomeStudent(user);

      await user.type(picker(), "thomas");
      await user.keyboard("{Escape}");
      expect(picker()).toHaveAttribute("aria-expanded", "false");
      expect(onOpenChange).not.toHaveBeenCalled();

      await user.keyboard("{Escape}");
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it("forgets the chosen college once its name is edited", async () => {
      const { user } = renderDialog();
      await fillValidForm(user);
      await becomeStudent(user);
      await user.type(picker(), "vayalar");
      await user.click(screen.getByRole("option", { name: "GOVT.ITI VAYALAR" }));

      await user.type(picker(), "x");
      await user.click(screen.getByRole("button", { name: "Take the Pledge" }));

      expect(screen.getByText("Choose your college or school, or pick Other.")).toBeInTheDocument();
      expect(mocks.submitPledge).not.toHaveBeenCalled();
    });

    it("lets students whose college isn't listed type its name, starting from their search", async () => {
      const { user } = renderDialog();
      await fillValidForm(user);
      await becomeStudent(user);

      await user.type(picker(), "GHSS Nedumangad");
      expect(screen.getAllByRole("option").map((option) => option.textContent)).toEqual(["Other (not listed)"]);
      await user.click(screen.getByRole("option", { name: "Other (not listed)" }));

      const name = screen.getByRole("textbox", { name: "Name of your college or school" });
      expect(name).toHaveValue("GHSS Nedumangad");
      expect(name).toHaveFocus();
      await user.clear(name);
      await user.type(name, "GHSS Nedumangad Town");

      await user.click(screen.getByRole("button", { name: "Take the Pledge" }));
      await waitFor(() => expect(mocks.submitPledge).toHaveBeenCalledTimes(1));
      expect(submitted().get("college_id")).toBe("other");
      expect(submitted().get("college_other")).toBe("GHSS Nedumangad Town");
    });

    it("requires a college from students and focuses the picker", async () => {
      const { user } = renderDialog();
      await fillValidForm(user);
      await becomeStudent(user);
      await user.click(screen.getByRole("button", { name: "Take the Pledge" }));

      expect(picker()).toHaveAttribute("aria-invalid", "true");
      expect(picker()).toHaveAccessibleDescription("Choose your college or school, or pick Other.");
      expect(picker()).toHaveFocus();
      expect(mocks.submitPledge).not.toHaveBeenCalled();
    });

    it("requires the name of an unlisted college and focuses its field", async () => {
      const { user } = renderDialog();
      await fillValidForm(user);
      await becomeStudent(user);
      await user.click(picker());
      await user.click(screen.getByRole("option", { name: "Other (not listed)" }));
      await user.click(screen.getByRole("button", { name: "Take the Pledge" }));

      const name = screen.getByRole("textbox", { name: "Name of your college or school" });
      expect(name).toHaveAccessibleDescription("Enter the name of your college or school.");
      expect(name).toHaveFocus();
    });

    it("shows the server's verdict on the chosen college", async () => {
      respondWith({
        status: "invalid",
        fieldErrors: { college_id: ["We couldn't find that college. Search again, or pick Other."] },
      });
      const { user } = renderDialog();
      await fillValidForm(user);
      await becomeStudent(user);
      await user.type(picker(), "ranny");
      await user.keyboard("{Enter}");
      await user.click(screen.getByRole("button", { name: "Take the Pledge" }));

      await waitFor(() =>
        expect(picker()).toHaveAccessibleDescription("We couldn't find that college. Search again, or pick Other."),
      );
    });

    it("shows how many matches were left out of a long list", async () => {
      serveColleges(
        Array.from({ length: 60 }, (_, index) => ({
          id: `00000000-0000-4000-8000-${String(index).padStart(12, "0")}`,
          title: `COLLEGE ${String(index).padStart(2, "0")}`,
        })),
      );
      const { user } = renderDialog();
      await becomeStudent(user);
      await user.type(picker(), "college");

      expect(screen.getAllByRole("option")).toHaveLength(51);
      expect(screen.getByText("Showing 50 of 60 matches. Keep typing to narrow them down.")).toBeInTheDocument();
    });

    it("falls back to typing the name when the list can't be loaded", async () => {
      fetchMock.mockResolvedValue(Response.json({ error: "unavailable" }, { status: 503 }));
      const { user } = renderDialog();
      await fillValidForm(user);
      await user.click(studentBox());

      const name = await screen.findByRole("textbox", { name: "College or school" });
      expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
      await user.type(name, "Model College Madikai");
      await user.click(screen.getByRole("button", { name: "Take the Pledge" }));

      await waitFor(() => expect(mocks.submitPledge).toHaveBeenCalledTimes(1));
      expect(submitted().get("college_id")).toBe("other");
      expect(submitted().get("college_other")).toBe("Model College Madikai");
    });
  });
});
