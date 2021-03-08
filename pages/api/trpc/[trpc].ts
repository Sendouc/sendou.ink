import * as trpc from "@trpc/server";
import { inferProcedureOutput } from "@trpc/server";
import * as trpcNext from "@trpc/server/dist/adapters/next";
import plusApi from "app/plus/api";
import superjson from "superjson";

export type Context = {};
const createContext = async ({
  req,
  res,
}: trpcNext.CreateNextContextOptions) => {
  return {};
};

export function createRouter() {
  return trpc.router<Context>();
}
// Important: only use this export with SSR/SSG
export const appRouter = createRouter().merge("plus.", plusApi);

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

// export API handler
export default trpcNext.createNextApiHandler({
  router: appRouter,
  createContext,
  transformer: superjson,
});
