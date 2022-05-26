import { z } from "zod";
import {
  IMPERSONATED_SESSION_KEY,
  SESSION_KEY,
} from "~/core/auth/authenticator.server";
import { sessionStorage } from "~/core/auth/session.server";
import { db } from "~/db";

export function notFoundIfFalsy<T>(value: T | null | undefined): T {
  if (!value) throw new Response(null, { status: 404 });

  return value;
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

export async function requireUser(request: Request) {
  const user = await getUser(request);

  if (!user) throw new Response(null, { status: 401 });

  return user;
}

export async function getUser(request: Request) {
  const session = await sessionStorage.getSession(
    request.headers.get("Cookie")
  );

  const userId =
    session.get(IMPERSONATED_SESSION_KEY) ?? session.get(SESSION_KEY);

  if (!userId) return;

  return db.users.findByIdentifier(userId);
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
