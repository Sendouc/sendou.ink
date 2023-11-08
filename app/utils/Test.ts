import type { ActionFunction } from "@remix-run/node";
import type { z } from "zod";

export function wrappedAction<T extends z.ZodTypeAny>({
  action,
}: {
  action: ActionFunction;
}) {
  return async (args: z.infer<T>, { user }: { user?: "admin" } = {}) => {
    const params = new URLSearchParams(args);
    const request = new Request("http://app.com/path", {
      method: "POST",
      body: params,
      headers: authHeader(user),
    });

    try {
      const res = (await action({
        request,
        context: {},
        params: {},
      })) as Promise<Response>;
      return res;
    } catch (thrown) {
      // it doesn't really matter if Response was thrown or returned
      if (thrown instanceof Response) {
        return thrown;
      }

      throw thrown;
    }
  };
}

function authHeader(user?: "admin") {
  return {};
  // if admin
}
