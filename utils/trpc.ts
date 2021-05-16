import { createReactQueryHooks, createTRPCClient } from "@trpc/react";
import superjson from "superjson";
// Type-only import:
// https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-8.html#type-only-imports-and-export
import type { AppRouter } from "../pages/api/trpc/[trpc]";

export const transformer = superjson;

// create react query hooks for trpc
export const trpc = createReactQueryHooks<AppRouter>();
