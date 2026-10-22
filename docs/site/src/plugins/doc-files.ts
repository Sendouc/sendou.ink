import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

/** The repo's markdown files the docs site shows, repo relative. */
export const DOC_FILE_PATTERNS = [
	"docs/*.md",
	"docs/dev/*.md",
	"CONTRIBUTING.md",
	"AGENTS.md",
];

/** Slug of the public API's overview, its endpoints page (`pages/api/endpoints.astro`) sits under it. */
export const PUBLIC_API_SLUG = "api";

/** Docs whose page isn't where their file is: the repo root's markdown files under `project/`, the public API's at its own section. */
const DOC_SLUG_OVERRIDES: Record<string, string> = {
	"CONTRIBUTING.md": "project/contributing",
	"AGENTS.md": "project/agent-instructions",
	"docs/dev/api.md": PUBLIC_API_SLUG,
};

/** Repo files with a generated page of their own, where the docs' links to them lead on the site. */
const GENERATED_PAGE_SLUGS: Record<string, string> = {
	"app/features/api-public/schema.ts": `${PUBLIC_API_SLUG}/endpoints`,
};

/** For docs whose file has no `# Heading` to take the title from. */
const TITLES: Record<string, string> = {
	"AGENTS.md": "Agent instructions",
};

/** Slug (and so the URL) of a repo relative markdown file's page, null when the site doesn't show it. */
export function docSlug(repoRelativePath: string) {
	const file = repoRelativePath.split(path.sep).join("/");
	if (DOC_SLUG_OVERRIDES[file]) return DOC_SLUG_OVERRIDES[file];

	const match = file.match(/^docs\/((?:dev\/)?[^/]+)\.md$/);
	return match ? match[1].toLowerCase() : null;
}

/** Slugs of every doc the site shows, sorted. */
export function allDocSlugs(repoRoot: string) {
	return fs
		.globSync(DOC_FILE_PATTERNS, { cwd: repoRoot })
		.flatMap((file) => docSlug(file) ?? [])
		.sort();
}

/** Slug of the page a link to a repo relative file leads to on the site, null for none (GitHub then). */
export function linkedPageSlug(repoRelativePath: string) {
	const file = repoRelativePath.split(path.sep).join("/");

	return docSlug(file) ?? GENERATED_PAGE_SLUGS[file] ?? null;
}

/** A doc's title: set by hand, its `# Heading`, or its file name. */
export function docTitle(repoRelativePath: string, source: string) {
	const file = repoRelativePath.split(path.sep).join("/");
	if (TITLES[file]) return TITLES[file];

	const heading = source.match(/^# (.+)$/m)?.[1];
	if (heading) return heading.trim();

	const name = path.basename(file, ".md").replaceAll("-", " ");
	return name.charAt(0).toUpperCase() + name.slice(1);
}

/** Date of the last commit touching each file, repo relative path → date. Empty outside a git checkout. */
export function lastCommitDates(repoRoot: string) {
	const dates = new Map<string, Date>();

	let log: string;
	try {
		log = execFileSync(
			"git",
			["log", "--format=%x00%cI", "--name-only", "--", ...DOC_FILE_PATTERNS],
			{ cwd: repoRoot, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 },
		);
	} catch {
		return dates;
	}

	for (const commit of log.split("\0").slice(1)) {
		const [date, ...files] = commit.split("\n").filter(Boolean);
		for (const file of files) {
			if (!dates.has(file)) dates.set(file, new Date(date));
		}
	}

	return dates;
}
