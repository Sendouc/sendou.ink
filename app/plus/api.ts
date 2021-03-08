import { createRouter } from "pages/api/trpc/[trpc]";
import * as z from "zod";

// The app's context - is generated for each incoming request
// export type Context = {};
// const createContext = ({
//   req,
//   res,
// }: trpcNext.CreateNextContextOptions): Context => {
//   return {};
// };

// function createRouter() {
//   return trpc.router<Context>();
// }
// Important: only use this export with SSR/SSG
const plusApi = createRouter().query("voting-history", {
  input: z
    .object({
      text: z.string().optional(),
    })
    .optional(),
  resolve({ input }) {
    // the `input` here is parsed by the parser passed in `input` the type inferred
    return {
      greeting: `hello ${input?.text ?? "world"}`,
    };
  },
});

// Exporting type _type_ AppRouter only exposes types that can be used for inference
// https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-8.html#type-only-imports-and-export
// export type AppRouter = typeof appRouter;

// export default trpcNext.createNextApiHandler({
//   router: appRouter,
//   createContext,
// });

export default plusApi;
