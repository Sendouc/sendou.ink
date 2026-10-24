import { describe, expect, test } from "vitest";
import { requireDevTools } from "./dev-tools-utils.server";

const requestWith = (fetchSite: string | null) =>
	new Request("http://localhost:5173/dev/server", {
		headers: fetchSite ? { "Sec-Fetch-Site": fetchSite } : {},
	});

describe("requireDevTools", () => {
	test.each([
		{ fetchSite: "same-origin", why: "the toolbar" },
		{ fetchSite: "none", why: "a link opened from a terminal" },
		{ fetchSite: null, why: "the CLI" },
	])("lets $why through", ({ fetchSite }) => {
		expect(() => requireDevTools(requestWith(fetchSite))).not.toThrow();
	});

	test.each(["cross-site", "same-site"])(
		"rejects a request another site's page made (%s)",
		(fetchSite) => {
			expect(() => requireDevTools(requestWith(fetchSite))).toThrow();
		},
	);
});
