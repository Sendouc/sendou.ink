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

/** Docs whose page isn't where their file is: the repo root's markdown files under `project/` or `dev/`, the public API's at its own section. */
const DOC_SLUG_OVERRIDES: Record<string, string> = {
	"CONTRIBUTING.md": "project/contributing",
	"AGENTS.md": "dev/conventions",
	"docs/dev/api.md": PUBLIC_API_SLUG,
};

/** Repo files with a generated page of their own, where the docs' links to them lead on the site. */
const GENERATED_PAGE_SLUGS: Record<string, string> = {
	"app/features/api-public/schema.ts": `${PUBLIC_API_SLUG}/endpoints`,
	"app/db/tables.ts": "reference/db-tables",
	".env.example": "reference/env-vars",
	"package.json": "reference/scripts",
};

/** For docs whose file has no `# Heading` to take the title from. */
const TITLES: Record<string, string> = {
	"AGENTS.md": "Conventions",
};

/** One line summaries of docs, shown on the home page's cards and as the page's meta description. */
const DESCRIPTIONS: Record<string, string> = {
	"AGENTS.md": "The code conventions every change follows.",
	"docs/dev/api.md": "How to get a token and the rules of using the API.",
	"docs/dev/architecture.md":
		"How the app runs in production and how a feature folder is laid out.",
	"docs/dev/database-schemas.md":
		"How columns are typed: booleans, timestamps, JSON and enums.",
	"docs/dev/discord-auth.md": "Setting up Discord login for local development.",
	"docs/dev/forms.md":
		"The schema-based SendouForm system and defining actions.",
	"docs/dev/how-to.md":
		"Recipes for common tasks like adding a migration or a route.",
	"docs/dev/living-docs.md":
		"How this site is built and how to write code that documents well.",
	"docs/dev/overlays.md":
		"Popovers, menus, selects and dialogs: scroll lock and mobile keyboards.",
	"docs/dev/permissions.md":
		"Global roles and per-object permissions, and where a new check goes.",
	"docs/dev/repositories.md":
		"Where database queries live and the conventions they follow.",
	"docs/dev/request-flow.md":
		"One request followed through every layer of the app.",
	"docs/dev/scripts.md":
		"One-off admin scripts for running the site in production.",
	"docs/dev/search-params.md":
		"Declaring URL search params once for loaders, client state and links.",
	"docs/dev/styles.md":
		"The theme tokens and how custom theme colors are generated.",
	"docs/dev/translation.md":
		"Translating the site and editing the translation files.",
};

/** Slug (and so the URL) of a repo relative markdown file's page, null when the site doesn't show it. */
export function docSlug(repoRelativePath: string) {
	const file = repoRelativePath.split(path.sep).join("/");
	if (DOC_SLUG_OVERRIDES[file]) return DOC_SLUG_OVERRIDES[file];

	const match = file.match(/^docs\/((?:dev\/)?[^/]+)\.md$/);
	return match ? match[1].toLowerCase() : null;
}

/** Feature whose `README.md` a repo relative file is, shown at the top of the feature's overview page. Null for any other file. */
export function readmeFeature(repoRelativePath: string) {
	const file = repoRelativePath.split(path.sep).join("/");

	return file.match(/^app\/features\/([^/]+)\/README\.md$/)?.[1] ?? null;
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

	const feature = readmeFeature(file);

	return (
		docSlug(file) ??
		(feature ? `features/${feature}` : null) ??
		GENERATED_PAGE_SLUGS[file] ??
		null
	);
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

export function docDescription(repoRelativePath: string) {
	return DESCRIPTIONS[repoRelativePath.split(path.sep).join("/")];
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
