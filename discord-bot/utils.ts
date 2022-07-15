import invariant from "tiny-invariant";
import { LOHI_TOKEN_HEADER_NAME } from "~/constants";
import type { PlusListLoaderData } from "~/routes/plus/list";
import ids from "./ids";

export function sendouInkFetch(path: string, init?: RequestInit) {
  invariant(process.env["SENDOU_INK_URL"], "SENDOU_INK_URL is not set");
  invariant(process.env["LOHI_TOKEN"], "LOHI_TOKEN is not set");

  return fetch(`${process.env["SENDOU_INK_URL"]}${path}`, {
    headers: [[LOHI_TOKEN_HEADER_NAME, process.env["LOHI_TOKEN"]]],
    ...init,
  });
}

export async function usersWithAccess(): Promise<PlusListLoaderData> {
  const response = await sendouInkFetch("/plus/list");

  if (!response.ok) {
    throw new Error(
      `Failed to fetch users. Response status was ${response.status}`
    );
  }

  return response.json();
}

const memberRoles = [
  "",
  ids.roles.plusOne,
  ids.roles.plusTwo,
  ids.roles.plusThree,
] as const;
export function plusTierToRoleId(tier?: number) {
  if (!tier) return;

  const result = memberRoles[tier ?? 0];
  if (!result) return;

  return result;
}

export function isPlusTierRoleId(id: string) {
  return memberRoles.slice(1).includes(id as any);
}
