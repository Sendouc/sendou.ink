import { createCookieSessionStorage } from "@remix-run/node";
import { DEV_MODE_ENABLED } from "~/constants";
import { invariant } from "~/utils/invariant";

const ONE_YEAR_IN_SECONDS = 31_536_000;

if (process.env.NODE_ENV === "production") {
  invariant(process.env["SESSION_SECRET"], "SESSION_SECRET is required");
}
export const authSessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    sameSite: "lax",
    // need to specify domain so that sub-domains can access it
    domain: !DEV_MODE_ENABLED ? "sendou.ink" : undefined,
    path: "/",
    httpOnly: true,
    secrets: [process.env["SESSION_SECRET"] ?? "secret"],
    secure: !DEV_MODE_ENABLED,
    maxAge: ONE_YEAR_IN_SECONDS,
  },
});
