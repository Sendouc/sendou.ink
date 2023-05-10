import { expect, type Locator, type Page } from "@playwright/test";

export async function selectWeapon({
  page,
  name,
  inputName = "weapon",
}: {
  page: Page;
  name: string;
  inputName?: string;
}) {
  return selectComboboxValue({ page, value: name, inputName });
}

export async function selectComboboxValue({
  page,
  value,
  inputName,
  locator,
}: {
  page: Page;
  value: string;
  inputName?: string;
  locator?: Locator;
}) {
  if (!locator && !inputName) {
    throw new Error("Must provide either locator or inputName");
  }
  const combobox = locator ?? page.getByTestId(`${inputName!}-combobox-input`);
  await combobox.clear();
  await combobox.fill(value);
  await combobox.press("Enter");
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

export async function fetchSendouInk<T>(url: string) {
  const res = await fetch(`http://localhost:5800${url}`);
  if (!res.ok) throw new Error("Response not successful");

  return res.json() as T;
}
