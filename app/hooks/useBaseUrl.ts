import { useMatches } from "@remix-run/react";

export function useBaseUrl() {
	const matches = useMatches();

	return (matches[0]?.data as any).baseUrl as string;
}
