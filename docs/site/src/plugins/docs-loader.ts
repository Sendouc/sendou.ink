import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { glob, type Loader } from "astro/loaders";
import {
	DOC_FILE_PATTERNS,
	docSlug,
	docTitle,
	lastCommitDates,
} from "./doc-files.ts";

/**
 * The repo's markdown docs read in place, so they keep working on GitHub. Their title comes from
 * the `# Heading` (dropped from the page by `dropTitle`) and "Last updated" from git.
 */
export function docsLoader({ repoRoot }: { repoRoot: string }): Loader {
	const loader = glob({
		base: pathToFileURL(repoRoot),
		pattern: DOC_FILE_PATTERNS,
		generateId: ({ entry }) => docSlug(entry) ?? entry,
	});

	return {
		...loader,
		load: (context) => {
			const lastUpdated = lastCommitDates(repoRoot);

			return loader.load({
				...context,
				parseData: (props) => {
					const file = props.filePath
						? path.relative(repoRoot, props.filePath)
						: "";

					return context.parseData({
						...props,
						data: {
							title: docTitle(file, fs.readFileSync(props.filePath!, "utf8")),
							lastUpdated: lastUpdated.get(file),
							...props.data,
						},
					});
				},
			});
		},
	};
}
