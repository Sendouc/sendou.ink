import type { ActionFunction } from "@remix-run/node";
import { seed } from "~/db/seed";

export const action: ActionFunction = () => {
  if (process.env.NODE_ENV === "production") {
    throw new Response(null, { status: 400 });
  }

  seed();

  return null;
};
