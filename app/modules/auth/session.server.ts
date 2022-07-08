import { createCookieSessionStorage } from "@remix-run/node";
import invariant from "tiny-invariant";

const ONE_YEAR_IN_SECONDS = 31_536_000;

if (process.env.NODE_ENV === "production") {
  invariant(process.env["SESSION_SECRET"], "SESSION_SECRET is required");
}
export const authSessionStorage = createCookieSessionStorage({
  cookie: {
    name: "_session",
    sameSite: "lax",
    path: "/",
    httpOnly: true,
    secrets: [process.env["SESSION_SECRET"] ?? "secret"],
    secure: process.env.NODE_ENV === "production",
    maxAge: ONE_YEAR_IN_SECONDS,
  },
});
