import { createReactQueryHooks, createTRPCClient } from "@trpc/react";
import { QueryClient } from "react-query";
import superjson from "superjson";
import type { AppRouter } from "../pages/api/trpc/[trpc]";

export const client = createTRPCClient<AppRouter>({
  url: "/api/trpc",
  transformer: superjson,
});

export const trpc = createReactQueryHooks({
  client,
  queryClient: new QueryClient(),
});
