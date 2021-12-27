import type { CSSProperties } from "react";
import { json, useLocation } from "remix";
import { z } from "zod";

export function makeTitle(endOfTitle?: string) {
  return endOfTitle ? `sendou.ink | ${endOfTitle}` : "sendou.ink";
}

/** Get logged in user from context. Throws with 401 error if no user found. */
export function requireUser(ctx: any) {
  const user = ctx.user;

  if (!user) {
    throw json("Log in required", { status: 401 });
  }

  return user as NonNullable<LoggedInUser>;
}

/** Get logged in user from context. Doesn't throw. */
export function getUser(ctx: any) {
  const user = ctx.user;

  return user as LoggedInUser;
}

/** Get link to log in with query param set as current page */
export function getLogInUrl(location: ReturnType<typeof useLocation>) {
  return `/auth/discord?origin=${encodeURIComponent(
    location.pathname + location.search
  )}`;
}

/** Parse formData of a request with the given schema. Throws HTTP 400 response if fails. */
export async function parseRequestFormData<T extends z.ZodTypeAny>({
  request,
  schema,
}: {
  request: Request;
  schema: T;
}): Promise<z.infer<T>> {
  return schema.parse(Object.fromEntries(await request.formData()));
}

/** @link https://stackoverflow.com/a/69413184 */
// @ts-expect-error
export const assertType = <A, B extends A>() => {};

export type LoggedInUser = {
  id: string;
  discordId: string;
  discordAvatar: string;
} | null;

export type Serialized<T> = {
  [P in keyof T]: T[P] extends Date
    ? string
    : T[P] extends Date | null
    ? string | null
    : Serialized<T[P]>;
};

export type Unpacked<T> = T extends (infer U)[]
  ? U
  : T extends (...args: any[]) => infer U
  ? U
  : T extends Promise<infer U>
  ? U
  : T;

export type MyReducerAction<
  K extends string,
  T extends {} | undefined = undefined
> = T extends {}
  ? {
      type: K;
      data: T;
    }
  : { type: K };

export interface MyCSSProperties extends CSSProperties {
  "--tournaments-bg"?: string;
  "--tournaments-text"?: string;
  "--tournaments-text-transparent"?: string;
  "--action-section-icon-color"?: string;
  "--brackets-columns"?: number;
  "--brackets-max-matches"?: number;
  "--brackets-bottom-border-length"?: number;
  "--brackets-column-matches"?: number;
  "--tabs-count"?: number;
}
