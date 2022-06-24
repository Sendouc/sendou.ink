import { createCookieSessionStorage } from "@remix-run/node";
import invariant from "tiny-invariant";

const ONE_YEAR_IN_SECONDS = 31_536_000;

invariant(process.env["SESSION_SECRET"]);
export const authSessionStorage = createCookieSessionStorage({
  cookie: {
    name: "_session",
    sameSite: "lax",
    path: "/",
    httpOnly: true,
    secrets: [process.env["SESSION_SECRET"]],
    secure: process.env.NODE_ENV === "production",
    maxAge: ONE_YEAR_IN_SECONDS,
  },
});
