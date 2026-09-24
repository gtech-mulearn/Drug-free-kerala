import { expect, test } from "@playwright/test";
import { openPage } from "./helpers";

test.describe("landing page", () => {
  test("is rendered on the server, pledge count included", async ({ request }) => {
    const response = await request.get("/");
    expect(response.status()).toBe(200);
    const html = await response.text();
    expect(html).toContain("5,886");
    expect(html).toContain("against addiction");
    expect(html).toContain("Kerala Excise Department");
    expect(html).toContain("#OperationThunder");
    expect(html).toContain("Our Journey");
    expect(html).not.toContain("gptengineer");
  });

  test("sends the security headers", async ({ request }) => {
    const response = await request.get("/");
    const headers = response.headers();

    const csp = headers["content-security-policy"] ?? "";
    expect(csp).toMatch(/script-src 'self' 'nonce-[A-Za-z0-9+/=]+' 'strict-dynamic'/);
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).not.toContain("unsafe-eval");
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["strict-transport-security"]).toContain("max-age=");
    expect(headers["x-powered-by"]).toBeUndefined();
  });

  test("issues a fresh CSP nonce per request", async ({ request }) => {
    const nonce = async () => (await request.get("/")).headers()["content-security-policy"]?.match(/nonce-([^']+)/)?.[1];
    expect(await nonce()).not.toBe(await nonce());
  });

  test("loads without CSP violations or console errors", async ({ page }) => {
    const problems: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") problems.push(message.text());
    });
    page.on("pageerror", (error) => problems.push(error.message));

    await page.goto("/");
    for (let step = 0; step < 10; step += 1) {
      await page.mouse.wheel(0, 1200);
      await page.waitForTimeout(150);
    }
    await page.waitForLoadState("networkidle");
    expect(problems).toEqual([]);
  });

  test("has one h1 and a skip link to the main content", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Skip to content" });
    await expect(skip).toBeFocused();
  });

  test("navigation links scroll to their section", async ({ page }, testInfo) => {
    await openPage(page);
    if (testInfo.project.name === "mobile") {
      await page.getByRole("button", { name: "Open menu" }).click();
      await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Journey" }).click();
    } else {
      await page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "Journey" }).click();
    }

    await expect(page).toHaveURL(/#journey$/);
    await expect(page.getByRole("heading", { name: "From Darkness to Light" })).toBeInViewport();
    await expect(page.locator("#journey")).toBeFocused();
  });

  test("the pledge counter endpoint is cacheable", async ({ request }) => {
    const response = await request.get("/api/pledges/total");
    expect(await response.json()).toEqual({ total: 5886 });
    expect(response.headers()["cache-control"]).toContain("s-maxage=15");
  });

  test("serves the link preview image", async ({ request }) => {
    const response = await request.get("/opengraph-image");
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("image/png");
  });

  test("journey films and press photos open in the lightbox", async ({ page }) => {
    await openPage(page);
    await page.getByRole("button", { name: "Play video: GTech Marathon 2023" }).click();
    await expect(page.getByRole("dialog").getByTitle("GTech Marathon 2023")).toBeVisible();
    await page.keyboard.press("Escape");

    // The press strip moves; pause it so the click lands where Playwright aims.
    await page.getByRole("button", { name: "Pause press clippings" }).click();
    await page.getByRole("button", { name: /^View photo: Dignitaries launching/ }).click();
    await expect(page.getByRole("dialog").getByRole("img", { name: /Dignitaries launching/ })).toBeVisible();
  });

  test("unknown routes get the branded 404", async ({ page }) => {
    const response = await page.goto("/certificate/123");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "404" })).toBeVisible();
  });
});
