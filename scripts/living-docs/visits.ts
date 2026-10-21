import fs from "node:fs";
import path from "node:path";
import { ROOT } from "./ast.ts";

/** Pathnames each e2e test visited in the last capture, written by `capture.ts`. */
export const VISITS_FILE = "docs/living/visits.json";
/** Screenshots of the last capture, gitignored. */
export const SCREENSHOTS_DIR = "docs/living/screenshots";

/** Spec → test title path (joined with " › ") → pathnames visited. */
export type Visits = Record<string, Record<string, string[]>>;

export function readVisits(): Visits {
	const file = path.join(ROOT, VISITS_FILE);
	if (!fs.existsSync(file)) return {};

	return JSON.parse(fs.readFileSync(file, "utf8"));
}

/** Repo relative path of the screenshot of a page divider, named after the spec line it starts on. */
export function screenshotFile(spec: string, line: number) {
	return `${SCREENSHOTS_DIR}/${path.basename(spec, ".spec.ts")}/${line}.jpg`;
}

/** Whether a test as written (names may be `${templates}`) is the test Playwright reported. */
export function testMatches(written: string[], reported: string[]) {
	const pattern = written
		.join(" › ")
		.split(/\$\{[^}]*\}/)
		.map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
		.join(".*");

	return new RegExp(`^${pattern}$`).test(reported.join(" › "));
}

/** Pathnames a test visited in the last capture. */
export function visitsOfTest(
	visits: Visits,
	spec: string,
	titlePath: string[],
) {
	return Object.entries(visits[spec] ?? {})
		.filter(([title]) => testMatches(titlePath, title.split(" › ")))
		.flatMap(([, pathnames]) => pathnames);
}
