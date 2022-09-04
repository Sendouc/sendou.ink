import { createCookieSessionStorage } from "@remix-run/node";

import { isTheme } from "./provider";
import type { Theme } from "./provider";
import invariant from "tiny-invariant";

if (process.env.NODE_ENV === "production") {
  invariant(process.env["SESSION_SECRET"], "SESSION_SECRET is required");
}
const sessionSecret = process.env["SESSION_SECRET"] ?? "secret";

const themeStorage = createCookieSessionStorage({
  cookie: {
    name: "theme",
    secure: true,
    secrets: [sessionSecret],
    sameSite: "lax",
    path: "/",
    httpOnly: true,
  },
});

async function getThemeSession(request: Request) {
  const session = await themeStorage.getSession(request.headers.get("Cookie"));
  return {
    getTheme: () => {
      const themeValue = session.get("theme");
      return isTheme(themeValue) ? themeValue : null;
    },
    setTheme: (theme: Theme) => session.set("theme", theme),
    commit: () => themeStorage.commitSession(session),
  };
}

export { getThemeSession };
