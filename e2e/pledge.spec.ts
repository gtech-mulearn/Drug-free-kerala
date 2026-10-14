import { expect, test, type APIRequestContext, type Page } from "@playwright/test";
import { openPage } from "./helpers";

const STATEMENTS = [
  "I am aware of the harmful effects",
  "I commit to not using drugs",
  "I will not encourage anyone",
  "I will report any instances",
  "I will support and help",
];

const uniqueEmail = (label: string) => `${label}.${Date.now()}.${Math.random().toString(36).slice(2, 7)}@example.com`;

/** The mock API (see playwright.config.ts). */
const MOCK_API = "http://127.0.0.1:4010";

async function openPledgeForm(page: Page) {
  await openPage(page);
  await page.getByRole("button", { name: "Take the Pledge" }).first().click();
  return page.getByRole("dialog", { name: "Join the Movement" });
}

async function fillPledgeForm(page: Page, name: string, email: string) {
  const dialog = await openPledgeForm(page);
  await dialog.getByLabel("Your name").fill(name);
  await dialog.getByLabel("Email").fill(email);
  for (const statement of STATEMENTS) await dialog.getByLabel(new RegExp(statement)).check();
  return dialog;
}

async function submitPledge(page: Page, name: string, email: string) {
  const dialog = await fillPledgeForm(page, name, email);
  await dialog.getByRole("button", { name: "Take the Pledge" }).click();
  // The dialog's accessible name follows its title, which changes per step.
  return page.getByRole("dialog");
}

test.describe("pledge", () => {
  test("new pledge → certificate download", async ({ page }) => {
    const dialog = await submitPledge(page, "Anjali Nair", uniqueEmail("anjali"));

    await expect(dialog.getByRole("heading", { name: "Pledge successful!" })).toBeVisible();
    const certificateId = await dialog.getByText(/^DKFC\d{5}$/).textContent();

    await dialog.getByRole("button", { name: "View certificate" }).click();
    await expect(dialog.getByRole("img", { name: /pledge certificate for Anjali Nair/ })).toBeVisible();

    const downloadButton = dialog.getByRole("button", { name: "Download" });
    await expect(downloadButton).toBeEnabled();
    const [download] = await Promise.all([page.waitForEvent("download"), downloadButton.click()]);
    expect(download.suggestedFilename()).toBe(`DrugFreeKerala-Certificate-${certificateId}.png`);
  });

  test("the certificate can be downloaded in Malayalam", async ({ page }) => {
    const dialog = await submitPledge(page, "Anjali Nair", uniqueEmail("ml-cert"));
    const certificateId = await dialog.getByText(/^DKFC\d{5}$/).textContent();
    await dialog.getByRole("button", { name: "View certificate" }).click();

    await dialog.getByText("മലയാളം").click();
    await expect(dialog.getByRole("radio", { name: "മലയാളം" })).toBeChecked();
    const downloadButton = dialog.getByRole("button", { name: "Download" });
    await expect(downloadButton).toBeEnabled();
    const [download] = await Promise.all([page.waitForEvent("download"), downloadButton.click()]);
    expect(download.suggestedFilename()).toBe(`DrugFreeKerala-Certificate-${certificateId}-ml.png`);
  });

  test("names in Malayalam script are accepted and rendered", async ({ page }) => {
    const dialog = await submitPledge(page, "അഞ്ജലി നായർ", uniqueEmail("malayalam"));
    await dialog.getByRole("button", { name: "View certificate" }).click();
    await expect(dialog.getByRole("button", { name: "Download" })).toBeEnabled();
  });

  test("an email pledged under another name reveals nothing about it", async ({ page }) => {
    const dialog = await submitPledge(page, "Someone Curious", "existing@example.com");

    await expect(dialog.getByRole("alert")).toContainText("already been used");
    await expect(page.getByText("Existing Person")).toHaveCount(0);
    await expect(page.getByText("DKFC00007")).toHaveCount(0);
  });

  test("pledging again with the same name returns the original certificate", async ({ page }) => {
    const dialog = await submitPledge(page, "existing  person", "existing@example.com");
    await expect(dialog.getByRole("heading", { name: "You've already pledged" })).toBeVisible();
    await expect(dialog.getByText("DKFC00007")).toBeVisible();
  });

  test("client-side validation blocks incomplete pledges", async ({ page }) => {
    const dialog = await openPledgeForm(page);
    await dialog.getByLabel("Your name").fill("A");
    await dialog.getByLabel("Email").fill("not-an-email");
    await dialog.getByRole("button", { name: "Take the Pledge" }).click();

    await expect(dialog.getByText("Enter your full name.")).toBeVisible();
    await expect(dialog.getByText("Enter a valid email address.")).toBeVisible();
    await expect(dialog.getByText("Accept every pledge statement to continue.")).toBeVisible();
    await expect(dialog.getByLabel("Your name")).toBeFocused();
  });

  test("#pledge deep link opens the form", async ({ page }) => {
    await openPage(page, "/#pledge");
    await expect(page.getByRole("dialog", { name: "Join the Movement" })).toBeVisible();
  });
});

test.describe("students", () => {
  /** What the mock's create/ stored for this email. */
  async function stored(request: APIRequestContext, email: string) {
    const response = await request.get(`${MOCK_API}/__pledges/?email=${encodeURIComponent(email)}`);
    expect(response.ok()).toBe(true);
    return response.json();
  }

  test("a student picks their college from the list", async ({ page, request }) => {
    const email = uniqueEmail("student");
    const dialog = await fillPledgeForm(page, "Anjali Nair", email);
    await dialog.getByRole("checkbox", { name: "Are you a student?" }).check();

    const picker = dialog.getByRole("combobox", { name: "College or school" });
    await picker.fill("nedumangad govt");
    await dialog.getByRole("option", { name: "GOVERNMENT POLYTECHNIC COLLEGE NEDUMANGAD", exact: true }).click();
    await expect(picker).toHaveValue("GOVERNMENT POLYTECHNIC COLLEGE NEDUMANGAD");
    await dialog.getByRole("button", { name: "Take the Pledge" }).click();

    await expect(page.getByRole("dialog").getByRole("heading", { name: "Pledge successful!" })).toBeVisible();
    expect(await stored(request, email)).toMatchObject({
      is_student: true,
      college_id: "9b3f1c2e-4d5a-4b6c-8d7e-0f1a2b3c4d5e",
      college_name: "GOVERNMENT POLYTECHNIC COLLEGE NEDUMANGAD",
    });
  });

  test("a student whose college isn't listed types its name", async ({ page, request }) => {
    const email = uniqueEmail("unlisted");
    const dialog = await fillPledgeForm(page, "Anjali Nair", email);
    await dialog.getByRole("checkbox", { name: "Are you a student?" }).check();

    await dialog.getByRole("combobox", { name: "College or school" }).fill("GHSS Nedumangad");
    await dialog.getByRole("option", { name: "Other (not listed)" }).click();
    const name = dialog.getByRole("textbox", { name: "Name of your college or school" });
    await expect(name).toHaveValue("GHSS Nedumangad");
    await expect(name).toBeFocused();
    await dialog.getByRole("button", { name: "Take the Pledge" }).click();

    await expect(page.getByRole("dialog").getByRole("heading", { name: "Pledge successful!" })).toBeVisible();
    expect(await stored(request, email)).toMatchObject({
      is_student: true,
      college_id: null,
      college_name: "GHSS Nedumangad",
    });
  });

  test("someone who is not a student is recorded as such", async ({ page, request }) => {
    const email = uniqueEmail("not-student");
    const dialog = await submitPledge(page, "Anjali Nair", email);

    await expect(dialog.getByRole("heading", { name: "Pledge successful!" })).toBeVisible();
    expect(await stored(request, email)).toMatchObject({ is_student: false, college_id: null, college_name: null });
  });
});

test.describe("certificate lookup", () => {
  async function lookUp(page: Page, name: string, email: string) {
    await openPage(page);
    await page.getByRole("button", { name: "Find my certificate" }).first().click();
    const dialog = page.getByRole("dialog", { name: "Find your certificate" });
    await dialog.getByLabel("Name you pledged with").fill(name);
    await dialog.getByLabel("Email").fill(email);
    await dialog.getByRole("button", { name: "Find certificate" }).click();
    return dialog;
  }

  test("finds a certificate when name and email match", async ({ page }) => {
    await lookUp(page, "Existing Person", "existing@example.com");
    await expect(page.getByRole("img", { name: /pledge certificate for Existing Person, ID DKFC00007/ })).toBeVisible();
  });

  test("an email alone is not enough", async ({ page }) => {
    const dialog = await lookUp(page, "Wrong Name", "existing@example.com");
    await expect(dialog.getByRole("alert")).toContainText("couldn't find a pledge");
    await expect(page.getByText("DKFC00007")).toHaveCount(0);
  });
});
