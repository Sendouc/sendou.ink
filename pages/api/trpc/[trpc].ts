import * as trpc from "@trpc/server";
import * as trpcNext from "@trpc/server/dist/adapters/next";
import plusApi from "app/plus/api";
import superjson from "superjson";

// The app's context - is generated for each incoming request
export type Context = {};
const createContext = ({
  req,
  res,
}: trpcNext.CreateNextContextOptions): Context => {
  return {};
};

export function createRouter() {
  return trpc.router<Context>();
}
// Important: only use this export with SSR/SSG
export const appRouter = createRouter().merge("plus", plusApi);

// Exporting type _type_ AppRouter only exposes types that can be used for inference
// https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-8.html#type-only-imports-and-export
export type AppRouter = typeof appRouter;

// export API handler
export default trpcNext.createNextApiHandler({
  router: appRouter,
  createContext,
  transformer: superjson,
});
