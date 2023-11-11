import type { ActionFunction } from "@remix-run/node";
import type { z } from "zod";
import { ADMIN_ID } from "~/constants";
import { NZAP_TEST_ID } from "~/db/seed/constants";
import { db, sql } from "~/db/sql";
import { SESSION_KEY } from "~/features/auth/core/authenticator.server";
import { authSessionStorage } from "~/features/auth/core/session.server";

export function wrappedAction<T extends z.ZodTypeAny>({
  action,
}: {
  action: ActionFunction;
}) {
  return async (
    args: z.infer<T>,
    { user }: { user?: "admin" | "regular" } = {},
  ) => {
    const params = new URLSearchParams(args);
    const request = new Request("http://app.com/path", {
      method: "POST",
      body: params,
      headers: await authHeader(user),
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

async function authHeader(user?: "admin" | "regular"): Promise<HeadersInit> {
  if (!user) return [];

  const session = await authSessionStorage.getSession();

  session.set(SESSION_KEY, user === "admin" ? ADMIN_ID : NZAP_TEST_ID);

  return [["Cookie", await authSessionStorage.commitSession(session)]];
}

export const database = {
  reset: () => {
    const tables = sql
      .prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE 'migrations';",
      )
      .all() as { name: string }[];

    sql.prepare("PRAGMA foreign_keys = OFF").run();
    for (const table of tables) {
      sql.prepare(`DELETE FROM "${table.name}"`).run();
    }
    sql.prepare("PRAGMA foreign_keys = ON").run();
  },
  insertUsers: (count: number) =>
    db
      .insertInto("User")
      .values(
        Array.from({ length: count }).map((_, i) => ({
          id: i + 1,
          discordName: `user${i + 1}`,
          discordDiscriminator: "0",
          discordId: String(i),
        })),
      )
      .execute(),
};
