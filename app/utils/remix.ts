import { z } from "zod";

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

/** Asserts condition is truthy. Throws a new `Response` with status code 400 and given message if falsy.  */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- same format as TS docs: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-7.html#assertion-functions
export function validate(condition: any): asserts condition {
  if (condition) return;

  throw new Response(null, { status: 400 });
}

export function makeTitle(title: string) {
  return `${title} | sendou.ink`;
}
