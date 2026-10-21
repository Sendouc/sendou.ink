import { execFileSync } from "node:child_process";
import path from "node:path";

/** The repo's markdown files the docs site shows, repo relative. */
export const DOC_FILE_PATTERNS = [
	"docs/*.md",
	"docs/dev/*.md",
	"CONTRIBUTING.md",
	"AGENTS.md",
	"translation-progress.md",
];

/** Pages of the repo root's markdown files, under `project/`. */
const ROOT_DOC_SLUGS: Record<string, string> = {
	"CONTRIBUTING.md": "project/contributing",
	"AGENTS.md": "project/agent-instructions",
	"translation-progress.md": "project/translation-progress",
};

/** For docs whose file has no `# Heading` to take the title from. */
const TITLES: Record<string, string> = {
	"AGENTS.md": "Agent instructions",
};

/** Slug (and so the URL) of a repo relative markdown file's page, null when the site doesn't show it. */
export function docSlug(repoRelativePath: string) {
	const file = repoRelativePath.split(path.sep).join("/");
	if (ROOT_DOC_SLUGS[file]) return ROOT_DOC_SLUGS[file];

	const match = file.match(/^docs\/((?:dev\/)?[^/]+)\.md$/);
	return match ? match[1].toLowerCase() : null;
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
