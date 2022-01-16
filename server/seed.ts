import { SeedVariationsSchema } from "~/utils/schemas";
import { seed } from "../prisma/seed/script";
import type { Express } from "express";

declare module "express-session" {
  export interface SessionData {
    returnTo?: string;
  }
}

export function setUpSeed(app: Express): void {
  if (process.env.NODE_ENV !== "development") return;

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  app.post("/seed", async (req, res) => {
    const variation = SeedVariationsSchema.optional().parse(
      req.query.variation
    );
    await seed(variation);

    res.status(200).end();
  });
}
