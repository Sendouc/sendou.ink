import { expect, type Locator, type Page } from "@playwright/test";

export async function selectWeapon({
  page,
  name,
}: {
  page: Page;
  name: string;
}) {
  const weaponCombobox = page.getByTestId("weapon-combobox-input");
  await weaponCombobox.clear();
  await weaponCombobox.fill(name);
  await weaponCombobox.press("Enter");
}

/** page.goto that waits for the page to be hydrated before proceeding */
export async function navigate({ page, url }: { page: Page; url: string }) {
  await page.goto(url);
  await expect(page.getByTestId("hydrated")).toHaveCount(1);
}

export function seed(page: Page) {
  return page.request.post("/seed");
}

export function impersonate(page: Page, userId = 1) {
  return page.request.post(`/auth/impersonate?id=${userId}`);
}

export function submit(page: Page) {
  return page.getByTestId("submit-button").click();
}

export function isNotVisible(locator: Locator) {
  return expect(locator).toHaveCount(0);
}

export function modalClickConfirmButton(page: Page) {
  return page.getByTestId("confirm-button").click();
}
