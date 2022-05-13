import { useMatches } from "@remix-run/react";
import type { RootLoaderData } from "~/root";

export const useUser = () => {
  const [root] = useMatches();

  return (root.data as RootLoaderData).user;
};
