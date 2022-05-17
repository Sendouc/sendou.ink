import { createCookieSessionStorage } from "@remix-run/node";
import invariant from "tiny-invariant";

invariant(process.env.SESSION_SECRET);
export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "_session",
    sameSite: "lax",
    path: "/",
    httpOnly: true,
    secrets:
      process.env.NODE_ENV === "production"
        ? [process.env.SESSION_SECRET]
        : ["secret"],
    secure: process.env.NODE_ENV === "production",
  },
});
