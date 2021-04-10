import * as trpc from "@trpc/server";
import { inferAsyncReturnType, inferProcedureOutput } from "@trpc/server";
import * as trpcNext from "@trpc/server/adapters/next";
import calendarApi from "app/calendar/api";
import freeAgentsApi from "app/freeAgents/api";
import plusApi from "app/plus/api";
import superjson from "superjson";
import { getMySession } from "utils/api";
import { trpc as trcpReactQuery } from "utils/trpc";

const createContext = async ({ req }: trpcNext.CreateNextContextOptions) => {
  const user = await getMySession(req);
  return { user };
};

type Context = inferAsyncReturnType<typeof createContext>;

export function createRouter() {
  return trpc.router<Context>();
}
// Important: only use this export with SSR/SSG
export const appRouter = createRouter()
  .merge("plus.", plusApi)
  .merge("calendar.", calendarApi)
  .merge("freeAgents.", freeAgentsApi);

// Exporting type _type_ AppRouter only exposes types that can be used for inference
// https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-8.html#type-only-imports-and-export
export type AppRouter = typeof appRouter;

/**
 * This is a helper method to infer the output of a query resolver
 * @example type HelloOutput = inferQueryOutput<'hello'>
 */
export type inferQueryOutput<
  TRouteKey extends keyof AppRouter["_def"]["queries"]
> = inferProcedureOutput<AppRouter["_def"]["queries"][TRouteKey]>;

export const ssr = trcpReactQuery.ssr(appRouter, { user: null });

export default trpcNext.createNextApiHandler({
  router: appRouter,
  createContext,
  transformer: superjson,
});
