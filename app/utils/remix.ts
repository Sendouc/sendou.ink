import { z } from "zod";
import { type TFunction, type Namespace } from "i18next";
import type navItems from "~/components/layout/nav-items.json";
import { json } from "@remix-run/node";
import type { UIMatch } from "@remix-run/react";

export function notFoundIfFalsy<T>(value: T | null | undefined): T {
  if (!value) throw new Response(null, { status: 404 });

  return value;
}

export function notFoundIfNullLike<T>(value: T | null | undefined): T {
  if (value === null || value === undefined)
    throw new Response(null, { status: 404 });

  return value;
}

export function badRequestIfFalsy<T>(value: T | null | undefined): T {
  if (!value) throw new Response(null, { status: 400 });

  return value;
}

export function parseSearchParams<T extends z.ZodTypeAny>({
  request,
  schema,
}: {
  request: Request;
  schema: T;
}): z.infer<T> {
  try {
    const url = new URL(request.url);
    return schema.parse(Object.fromEntries(url.searchParams));
  } catch (e) {
    if (e instanceof z.ZodError) {
      console.error(e);
      throw new Response(JSON.stringify(e), { status: 400 });
    }

    throw e;
  }
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
    return schema.parse(formDataToObject(await request.formData()));
  } catch (e) {
    if (e instanceof z.ZodError) {
      console.error(e);
      throw new Response(JSON.stringify(e), { status: 400 });
    }

    throw e;
  }
}

/** Parse formData with the given schema. Throws HTTP 400 response if fails. */
export function parseFormData<T extends z.ZodTypeAny>({
  formData,
  schema,
}: {
  formData: FormData;
  schema: T;
}): z.infer<T> {
  try {
    return schema.parse(formDataToObject(formData));
  } catch (e) {
    if (e instanceof z.ZodError) {
      console.error(e);
      throw new Response(JSON.stringify(e), { status: 400 });
    }

    throw e;
  }
}

export async function safeParseRequestFormData<T extends z.ZodTypeAny>({
  request,
  schema,
}: {
  request: Request;
  schema: T;
}): Promise<
  { success: true; data: z.infer<T> } | { success: false; errors: string[] }
> {
  const parsed = schema.safeParse(formDataToObject(await request.formData()));

  // this implementation is somewhat redundant but it's the only way I got types to work nice
  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.errors.map((error) => error.message),
    };
  }

  return {
    success: true,
    data: parsed.data,
  };
}

function formDataToObject(formData: FormData) {
  const result: Record<string, string | string[]> = {};

  for (const [key, value] of formData.entries()) {
    const newValue = String(value);
    const existingValue = result[key];

    if (Array.isArray(existingValue)) {
      existingValue.push(newValue);
    } else if (typeof existingValue === "string") {
      result[key] = [existingValue, newValue];
    } else {
      result[key] = newValue;
    }
  }

  return result;
}

/** Asserts condition is truthy. Throws a new `Response` with given status code if falsy.  */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- same format as TS docs: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-7.html#assertion-functions
export function validate(
  condition: any,
  message?: string,
  status = 400,
): asserts condition {
  if (condition) return;

  throw new Response(
    message ? JSON.stringify({ validationError: message }) : undefined,
    {
      status,
    },
  );
}

export type Breadcrumb =
  | { imgPath: string; type: "IMAGE"; href: string }
  | { text: string; type: "TEXT"; href: string };

/**
 * Our custom type for route handles - the keys are defined by us or
 * libraries that parse them.
 *
 * Can be set per route using `export const handle: SendouRouteHandle = { };`
 * Can be accessed for all currently active routes via the `useMatches()` hook.
 */
export type SendouRouteHandle = {
  /** The i18n translation files used for this route, via remix-i18next */
  i18n?: Namespace;

  /**
   * A function that returns the breadcrumb text that should be displayed in
   * the <Breadcrumb> component
   */
  breadcrumb?: (args: {
    match: UIMatch;
    t: TFunction<"common", undefined>;
  }) => Breadcrumb | Array<Breadcrumb> | undefined;

  /** The name of a navItem that is active on this route. See nav-items.json */
  navItemName?: (typeof navItems)[number]["name"];
};

/** Caches the loader response with "private" Cache-Control meaning that CDN won't cache the response.
 * To be used when the response is different for each user. This is especially useful when the response
 * is prefetched on link hover.
 */
export function privatelyCachedJson<T>(data: T) {
  return json(data, {
    headers: { "Cache-Control": "private, max-age=5" },
  });
}
