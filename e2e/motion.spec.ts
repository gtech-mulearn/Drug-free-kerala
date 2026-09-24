import { expect, test, type Page } from "@playwright/test";
import { openPage } from "./helpers";

/**
 * Motion must never cost content: every entrance target has to end up
 * visible whatever the visitor's settings, device speed or scripts.
 */

/** Entrance targets that are still hidden (transparent or clipped shut). */
function hiddenEntrances(page: Page) {
  return page.evaluate(() =>
    Array.from(document.querySelectorAll<HTMLElement>("[data-reveal], [data-split], [data-clip], [data-count]"))
      .filter((element) => {
        const style = getComputedStyle(element);
        return Number(style.opacity) < 0.99 || style.clipPath.startsWith("inset(100%");
      })
      .map((element) => element.outerHTML.slice(0, 90)),
  );
}

const noHorizontalScroll = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);

test.describe("motion safety", () => {
  test("reduced motion shows every section at rest, with native scrolling", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-motion", "static");
    await expect(page.locator("html")).not.toHaveClass(/lenis/);
    expect(await hiddenEntrances(page)).toEqual([]);
  });

  test.describe("without JavaScript", () => {
    test.use({ javaScriptEnabled: false });

    test("every section is visible, with no loader", async ({ page }) => {
      await page.goto("/");
      expect(await hiddenEntrances(page)).toEqual([]);
      await expect(page.getByText("5,886").first()).toBeAttached();
      await expect(page.locator(".preloader")).toBeHidden();
    });
  });

  test("the failsafe reveals everything when scripts never arrive", async ({ page }) => {
    await page.route("**/_next/static/chunks/**/*.js", (route) => route.abort());
    await page.goto("/");
    // The loader (an inline script) still runs; the failsafe's clock starts when it lifts.
    await page.waitForFunction(() => !document.documentElement.hasAttribute("data-preloading"));
    await page.waitForTimeout(3300);
    expect(await hiddenEntrances(page)).toEqual([]);
  });

  test("the loader counts to 100 from the real load, then gets out of the way", async ({ page }) => {
    await page.goto("/");
    const loader = page.locator(".preloader");
    await expect(loader).toHaveClass(/preloader--done/);
    await expect(loader.locator("[data-preloader-count]")).toHaveText("100");
    await expect(page.locator("html")).toHaveAttribute("data-preloaded-at", /^\d+$/);
    expect(await page.evaluate(() => document.documentElement.hasAttribute("data-preloading"))).toBe(false);
    await expect(loader).toBeHidden();
    // The page scrolls again once it has lifted.
    await page.mouse.wheel(0, 800);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
  });

  test("with motion, content reveals as it scrolls into view", async ({ page }) => {
    await page.goto("/");
    // "static" is the designed outcome when the engine starts after the 2.5 s
    // failsafe (a loaded machine); either way the content must end up visible.
    await expect(page.locator("html")).toHaveAttribute("data-motion", /^(ready|static)$/);
    const heading = page.getByRole("heading", { name: "Key initiatives" });
    await heading.scrollIntoViewIfNeeded();
    await expect.poll(() => heading.evaluate((element) => getComputedStyle(element).opacity)).toBe("1");
  });

  test("keyboard focus reveals a timeline film before it has animated in", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === "mobile", "the timeline only pins on desktop");
    await page.goto("/");
    const film = page.getByRole("button", { name: "Play video: GTech Marathon Highlights 2025" });
    await film.focus();
    await expect
      .poll(() => film.evaluate((element) => getComputedStyle(element.closest("[data-timeline-body]")!).opacity))
      .toBe("1");
  });

  test("deep links land on their section", async ({ page }) => {
    await page.goto("/#journey");
    await expect(page.getByRole("heading", { name: "From Darkness to Light" })).toBeInViewport();
  });

  test("nothing scrolls sideways, even with a seven-digit pledge total", async ({ page }) => {
    await page.goto("/");
    expect(await noHorizontalScroll(page)).toBe(true);
    await page.evaluate(() => {
      for (const node of document.querySelectorAll("[data-testid^='pledge-total'] [data-count]")) {
        node.firstChild!.nodeValue = "12,34,56,789";
      }
    });
    expect(await noHorizontalScroll(page)).toBe(true);
  });

  test("layout recovers after a resize", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === "mobile", "resizes from a desktop viewport");
    await openPage(page);
    for (let step = 0; step < 4; step += 1) await page.mouse.wheel(0, 700);
    await page.setViewportSize({ width: 820, height: 1180 });
    await page.waitForTimeout(600);

    // The header hides while scrolling down; scrolling up brings it back.
    await page.mouse.wheel(0, -300);
    await expect(page.getByRole("button", { name: "Open menu" })).toBeInViewport();
    await page.getByRole("button", { name: "Open menu" }).click();
    await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Journey" }).click();
    await expect(page.getByRole("heading", { name: "From Darkness to Light" })).toBeInViewport();
    expect(await noHorizontalScroll(page)).toBe(true);
  });

  test("an open dialog locks the page but its own content still scrolls", async ({ page }) => {
    await page.setViewportSize({ width: 400, height: 560 });
    await openPage(page);
    await page.getByRole("button", { name: "Take the pledge" }).first().click();
    const dialog = page.getByRole("dialog", { name: "Join the Movement" });
    await expect(dialog).toBeVisible();

    const pageScroll = await page.evaluate(() => window.scrollY);
    const box = await dialog.boundingBox();
    await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
    await page.mouse.wheel(0, 600);
    await page.waitForTimeout(500);

    expect(await page.evaluate(() => window.scrollY)).toBe(pageScroll);
    expect(await dialog.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
  });
});
