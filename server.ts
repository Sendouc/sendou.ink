import * as trpcExpress from "@trpc/server/adapters/express/dist/trpc-server-adapters-express.cjs";
import cors from "cors";
import express from "express";
import { tournament as tournamentRouter } from "./scenes/tournament/router";
import { createContext, createRouter } from "./utils/trpc-server";

export const appRouter = createRouter().merge("tournament.", tournamentRouter);

export type AppRouter = typeof appRouter;

async function main() {
  const app = express();

  app.use(cors());

  app.use((req, _res, next) => {
    console.log("⬅️ ", req.method, req.path, req.body ?? req.query);

    next();
  });

  app.use(
    "/trpc",
    trpcExpress.createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  app.listen(2021, () => {
    console.log("listening on port 2021");
  });
}

main();
