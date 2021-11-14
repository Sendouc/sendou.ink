import { createTRPCClient } from "@trpc/client";
import type { inferProcedureOutput } from "@trpc/server";
import type { AppRouter } from "../server";

export const trpcClient = createTRPCClient<AppRouter>({
  url: "http://localhost:2021/trpc",
});

export type InferQueryOutput<
  TRouteKey extends keyof AppRouter["_def"]["queries"]
> = inferProcedureOutput<AppRouter["_def"]["queries"][TRouteKey]>;
