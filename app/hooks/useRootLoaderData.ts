import { useMatches } from "@remix-run/react";
import invariant from "tiny-invariant";
import type { RootLoaderData } from "~/root";

export function useRootLoaderData() {
  const [root] = useMatches();
  invariant(root);

  return root.data as RootLoaderData;
}
