import { expect, type Page } from "@playwright/test";

/**
 * Opens a page and waits until React has hydrated it. Clicks on
 * server-rendered buttons before hydration are lost, which makes tests flaky
 * on a loaded machine. <html data-motion> is set by a client effect
 * (MotionRuntime), so its presence means the page is interactive.
 */
export async function openPage(page: Page, path = "/") {
  await page.goto(path);
  await expect(page.locator("html")).toHaveAttribute("data-motion", /.+/);
}
