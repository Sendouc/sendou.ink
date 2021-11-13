import type { AppRouter } from "../server";
import { createTRPCClient } from "@trpc/client";

export const trpcClient = createTRPCClient<AppRouter>({
  url: "http://localhost:2021/trpc",
});
