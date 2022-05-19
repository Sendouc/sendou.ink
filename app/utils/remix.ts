import { z } from "zod";
import { authenticator } from "~/core/auth/authenticator.server";

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
  const user = await authenticator.isAuthenticated(request);

  if (!user) throw new Response(null, { status: 401 });

  return user;
}
