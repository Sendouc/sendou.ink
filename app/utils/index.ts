import { Mode } from "@prisma/client";
import type { CSSProperties } from "react";
import { json, useLocation } from "remix";
import type { EventTargetRecorder } from "server/events";
import { z } from "zod";
import { LoggedInUserSchema } from "~/utils/schemas";

export function makeTitle(endOfTitle?: string) {
  return endOfTitle ? `sendou.ink | ${endOfTitle}` : "sendou.ink";
}

/** Get logged in user from context. Throws with 401 error if no user found. */
export function requireUser(ctx: unknown) {
  const data = LoggedInUserSchema.parse(ctx);

  if (!data?.user) {
    throw json("Log in required", { status: 401 });
  }

  return data?.user;
}

/** Get logged in user from context. Doesn't throw. */
export function getUser(ctx: unknown) {
  const data = LoggedInUserSchema.parse(ctx);

  return data?.user;
}

/** Get events object from context. Throws with 500 error if none found found. */
export function requireEvents(ctx: unknown) {
  try {
    const data = z.object({ events: z.unknown() }).parse(ctx);

    // TODO:
    return data.events as EventTargetRecorder;
  } catch (e) {
    console.error(e);
    throw json("Events missing", { status: 500 });
  }
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

export function modeToImageUrl(mode: Mode) {
  return `/img/modes/${mode}.webp`;
}

/** Parse formData of a request with the given schema. Throws HTTP 400 response if fails. */
export async function parseRequestFormData<T extends z.ZodTypeAny>({
  request,
  schema,
}: {
  request: Request;
  schema: T;
}): Promise<z.infer<T>> {
  try {
    // False alarm
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return schema.parse(Object.fromEntries(await request.formData()));
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
    const parsedValue = z.string().parse(value);
    return JSON.parse(parsedValue);
  } catch (e) {
    return undefined;
  }
}

export type Serialized<T> = {
  [P in keyof T]: T[P] extends Date
    ? string
    : T[P] extends Date | null
    ? string | null
    : Serialized<T[P]>;
};

export type Unpacked<T> = T extends (infer U)[]
  ? U
  : T extends (...args: unknown[]) => infer U
  ? U
  : T extends Promise<infer U>
  ? U
  : T;

export type MyReducerAction<
  K extends string,
  T extends Record<string, unknown> | undefined = undefined
> = T extends Record<string, unknown>
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
