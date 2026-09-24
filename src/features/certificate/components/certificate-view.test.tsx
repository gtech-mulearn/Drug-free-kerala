import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CertificateView } from "./certificate-view";

type RenderInput = { language: string; templateSrc: string };

const mocks = vi.hoisted(() => ({
  renderCertificate: vi.fn((_canvas: HTMLCanvasElement, _input: RenderInput) => Promise.resolve()),
  canvasToPng: vi.fn(() => Promise.resolve(new Blob(["png"], { type: "image/png" }))),
}));

vi.mock("../lib/render-certificate", () => mocks);

const certificate = { name: "Anjali Nair", certificateId: "DKFC00042" };
const lastRender = () => mocks.renderCertificate.mock.calls.at(-1)?.[1] as RenderInput;

beforeEach(() => {
  vi.stubGlobal("URL", Object.assign(URL, { createObjectURL: vi.fn(() => "blob:certificate"), revokeObjectURL: vi.fn() }));
});

describe("CertificateView", () => {
  it("renders the English certificate by default", async () => {
    render(<CertificateView certificate={certificate} />);
    await waitFor(() => expect(mocks.renderCertificate).toHaveBeenCalled());
    expect(lastRender().language).toBe("en");
    expect(screen.getByRole("radio", { name: "English" })).toBeChecked();
  });

  it("re-renders in Malayalam from its own template when chosen", async () => {
    const user = userEvent.setup();
    render(<CertificateView certificate={certificate} />);
    await waitFor(() => expect(mocks.renderCertificate).toHaveBeenCalled());
    const englishTemplate = lastRender().templateSrc;

    await user.click(screen.getByRole("radio", { name: "മലയാളം" }));

    await waitFor(() => expect(lastRender().language).toBe("ml"));
    expect(lastRender().templateSrc).not.toBe(englishTemplate);
    expect(screen.getByRole("img", { name: /pledge certificate for Anjali Nair/ })).toHaveAttribute("lang", "ml");
  });

  it("names the download after the chosen language", async () => {
    const user = userEvent.setup();
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    render(<CertificateView certificate={certificate} />);
    await user.click(screen.getByRole("radio", { name: "മലയാളം" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Download" })).toBeEnabled());

    await user.click(screen.getByRole("button", { name: "Download" }));

    await waitFor(() => expect(click).toHaveBeenCalled());
    expect((click.mock.contexts.at(-1) as HTMLAnchorElement).download).toBe("DrugFreeKerala-Certificate-DKFC00042-ml.png");
  });
});
