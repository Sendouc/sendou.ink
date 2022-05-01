import { Mode, User } from "@prisma/client";
import type { CSSProperties } from "react";
import { json } from "@remix-run/node";
import { useLocation } from "@remix-run/react";
import type { Socket } from "socket.io-client";
import { z } from "zod";
import {
  LoggedInUserFromContextSchema,
  LoggedInUserSchema,
} from "~/utils/schemas";

export function flipObject<
  K extends string | number,
  T extends string | number
>(obj: Record<T, K>): Record<K, T> {
  const result = Object.fromEntries(
    Object.entries(obj).map((a) => a.reverse())
  ) as Record<K, T>;

  return result;
}

export function userFullDiscordName(
  user: Pick<User, "discordName" | "discordDiscriminator">
) {
  return `${user.discordName}#${user.discordDiscriminator}`;
}

export function makeTitle(title?: string | string[]) {
  if (!title) return "sendou.ink";
  if (typeof title === "string") return `${title} | sendou.ink`;
  return `${title.join(" | ")} | sendou.ink`;
}

/** Get logged in user from context. Throws with 401 error if no user found. */
export function requireUser(ctx: unknown) {
  const data = LoggedInUserSchema.parse(ctx);

  if (!data?.user) {
    throw json("Log in required", { status: 401 });
  }

  return data?.user;
}

export function requireUserNew(ctx: unknown) {
  const data = LoggedInUserFromContextSchema.parse(ctx);

  if (!data?.user) {
    throw json("Log in required", { status: 401 });
  }

  return data?.user;
}

/** Get logged in user from context. Doesn't throw. */
export function getUser(ctx: unknown) {
  const data = LoggedInUserSchema.parse(ctx);

  if (!data?.user) return;

  return data?.user;
}

export function getUserNew(ctx: unknown) {
  const data = LoggedInUserFromContextSchema.parse(ctx);

  if (!data?.user) return;

  return data?.user;
}

export function getSocket(ctx: unknown) {
  //@ts-expect-error no way we validating this
  return ctx.socket as Socket;
}

// https://stackoverflow.com/a/57888548
export function fetchTimeout(url: string, ms: number, options: RequestInit) {
  const controller = new AbortController();
  const promise = fetch(url, { signal: controller.signal, ...options });
  if (options.signal) {
    options.signal.addEventListener("abort", () => controller.abort());
  }
  const timeout = setTimeout(() => controller.abort(), ms);
  return promise.finally(() => clearTimeout(timeout));
}

/** Asserts condition is truthy. Throws a new `Response` with status code 400 and given message if falsy.  */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- same format as TS docs: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-7.html#assertion-functions
export function validate(condition: any, message: string): asserts condition {
  if (condition) return;

  throw new Response(message, { status: 400 });
}

/** Get link to log in with query param set as current page */
export function getLogInUrl(location: ReturnType<typeof useLocation>) {
  return `/auth/discord?origin=${encodeURIComponent(
    location.pathname + location.search
  )}`;
}

export function stageNameToImageUrl(name: string) {
  return `/img/stages/${name.replaceAll(" ", "-").toLowerCase()}.webp`;
}

export function stageNameToBannerImageUrl(name: string) {
  // TODO: webp
  return `/img/stage-banners/${name.replaceAll(" ", "-").toLowerCase()}.png`;
}

export function modeToImageUrl(mode: Mode) {
  return `/img/modes/${mode}.webp`;
}

export function layoutIcon(icon: string) {
  return `/img/layout/${icon}.webp`;
}

export function listToUserReadableString(input: string[]): string {
  const inputClone = [...input];
  const last = inputClone.pop();
  if (!last) return "";
  if (inputClone.length === 0) return last;

  return `${inputClone.join(", ")} & ${last}`;
}

/** Parse formData of a request with the given schema. Throws HTTP 400 response if fails. */
export async function parseRequestFormData<T extends z.ZodTypeAny>({
  request,
  schema,
  useBody = false,
}: {
  request: Request;
  schema: T;
  useBody?: boolean;
}): Promise<z.infer<T>> {
  try {
    // False alarm
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return schema.parse(
      useBody
        ? await request.json()
        : Object.fromEntries(await request.formData())
    );
  } catch (e) {
    if (e instanceof z.ZodError) {
      console.error(e);
      let errorMessage = "Request had following issues: ";
      for (const issue of e.issues) {
        errorMessage += `${issue.message} (path: ${issue.path.join(",")});`;
      }
      throw new Response(errorMessage, { status: 400 });
    }

    throw e;
  }
}

export function safeJSONParse(value: unknown): unknown {
  try {
    if (typeof value !== "string") return value;
    const parsedValue = z.string().parse(value);
    return JSON.parse(parsedValue);
  } catch (e) {
    return undefined;
  }
}

export function falsyToNull(value: unknown): unknown {
  if (value) return value;

  return null;
}

export function dateToUnixTimestamp(date: Date) {
  return Math.floor(date.getTime() / 1000);
}
export function secondsToMilliseconds(timeInSeconds: number) {
  return timeInSeconds * 1000;
}

// export function isFeatureFlagOn({
//   flag,
//   userId,
// }: {
//   flag: keyof EnvironmentVariables;
//   userId?: string;
// }) {
//   if (typeof window === "undefined") return false;

//   if (window.ENV[flag] === "admin") {
//     return userId === ADMIN_UUID || userId === NZAP_UUID;
//   }

//   return window.ENV[flag] === "true";
// }

export type Serialized<T> = {
  [P in keyof T]: T[P] extends Date
    ? string
    : T[P] extends Date | null
    ? string | null
    : Serialized<T[P]>;
};

export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

export type Unpacked<T> = T extends (infer U)[]
  ? U
  : T extends (...args: unknown[]) => infer U
  ? U
  : T extends Promise<infer U>
  ? U
  : T;

export type ValueOf<T> = T[keyof T];

export type MyReducerAction<
  K extends string,
  T extends Record<string, unknown> | undefined = undefined
> = T extends Record<string, unknown>
  ? {
      type: K;
      data: T;
    }
  : { type: K };

export type ArrayElement<A> = A extends readonly (infer T)[] ? T : never;

// TODO: make everything start with _ like _tournament-bg-url to avoid collision with global css vars
export interface MyCSSProperties extends CSSProperties {
  "--tournaments-bg"?: string;
  "--tournaments-text"?: string;
  "--tournaments-text-transparent"?: string;
  "--_tournament-bg-url"?: string;
  "--_avatar-size"?: string;
  "--action-section-icon-color"?: string;
  "--brackets-columns"?: number;
  "--brackets-max-matches"?: number;
  "--brackets-bottom-border-length"?: number;
  "--brackets-column-matches"?: number;
  "--height-override"?: string;
}

export interface PageTitle {
  pageTitle: string;
}

/** Minimal information on user to show their name and avatar */
export interface UserLean {
  id: string;
  discordId: string;
  discordDiscriminator: string;
  discordAvatar: string | null;
  discordName: string;
}
