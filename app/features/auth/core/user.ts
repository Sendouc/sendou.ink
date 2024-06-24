import { useMatches } from "@remix-run/react";
import type { RootLoaderData } from "~/root";
import invariant from "~/utils/invariant";

export function useUser() {
	const [root] = useMatches();
	invariant(root);

	return (root.data as RootLoaderData | undefined)?.user;
}
