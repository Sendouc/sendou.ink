import path from "node:path";

const GITHUB_BLOB_URL = "https://github.com/sendou-ink/sendou.ink/blob/main";

/** File name of a feature's page. */
export function featurePageFile(featureId: string) {
	return `${featureId}.html`;
}

export function githubUrl(file: string, line: number) {
	return `${GITHUB_BLOB_URL}/${encodeURI(file)}#L${line}`;
}

/** Id of an e2e test's element on its feature page. */
export function testAnchor(
	specPath: string,
	groupName: string | null,
	test: { name: string; line: number; modifier: string | null },
) {
	return anchor(
		path.basename(specPath, ".spec.ts"),
		groupName ?? "",
		test.name,
		test.modifier === "hook" ? String(test.line) : "",
	);
}

/** Id of a module export's element, types suffixed as `Stats` and `stats` may both be exported. */
export function exportAnchor(
	moduleName: string,
	exported: { name: string; kind: string },
) {
	const isType = exported.kind === "type" || exported.kind === "interface";
	return anchor(moduleName, exported.name, isType ? "type" : "");
}

/** Id of a route's element on its feature page. */
export function routeAnchor(route: { file: string; isLayout: boolean }) {
	return anchor(route.file, route.isLayout ? "layout" : "");
}

export function anchor(...parts: string[]) {
	return parts
		.filter(Boolean)
		.join("-")
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "");
}
