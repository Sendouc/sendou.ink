import { createReactQueryHooks, createTRPCClient } from "@trpc/react";
import type { AppRouter } from "pages/api/trpc/[trpc]";
import { QueryClient } from "react-query";
import superjson from "superjson";

export const client = createTRPCClient<AppRouter>({
  url: "/api/trpc",
  transformer: superjson,
});

export const trpc = createReactQueryHooks({
  client,
  queryClient: new QueryClient({
    defaultOptions: {
      queries: {
        // queries never go stale to save some work
        // on our poor database
        staleTime: Infinity,
      },
    },
  }),
});
