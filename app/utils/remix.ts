import { z } from "zod";
import { type TFunction, type Namespace } from "react-i18next";
import { type RouteMatch } from "@remix-run/react";
import type navItems from "~/components/layout/nav-items.json";

export function notFoundIfFalsy<T>(value: T | null | undefined): T {
  if (!value) throw new Response(null, { status: 404 });

  return value;
}

export function badRequestIfFalsy<T>(value: T | null | undefined): T {
  if (!value) throw new Response(null, { status: 400 });

  return value;
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
    return schema.parse(formDataToObject(await request.formData()));
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
export function validate(condition: any, status = 400): asserts condition {
  if (condition) return;

  throw new Response(null, { status });
}

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
    match: RouteMatch;
    t: TFunction<"common", undefined>;
  }) => string | undefined;

  /** The name of a navItem that is active on this route. See nav-items.json */
  navItemName?: typeof navItems[number]["name"];
};
