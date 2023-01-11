import type { Page } from "@playwright/test";

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
  page.getByTestId("hydrated");
}

export async function seed(page: Page) {
  return page.request.post("/seed");
}

export async function impersonate(page: Page, userId = 1) {
  return page.request.post(`/auth/impersonate?id=${userId}`);
}

export async function submit(page: Page) {
  return page.getByTestId("submit-button").click();
}
