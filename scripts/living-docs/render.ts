import path from "node:path";
import { SCRIPT, STYLES } from "./assets.ts";
import { type Coverage, type RouteCoverage, routeFeature } from "./coverage.ts";
import {
	type Chapter,
	type Divider,
	KNOWN_USERS,
	type Run,
	type Segment,
	type SpecDoc,
	type Step,
	type TestDoc,
} from "./e2e.ts";
import type { FeatureConfig } from "./features.ts";
import { escapeHtml, highlight } from "./highlight.ts";
import {
	anchor,
	exportAnchor,
	featurePageFile,
	githubUrl,
	routeAnchor,
	testAnchor,
} from "./links.ts";
import type { ExportDoc, ModuleDoc, UsageGroup } from "./modules.ts";
import type { SourceRef } from "./page-objects.ts";
import type { UnitTestCase } from "./unit-tests.ts";
import { screenshotFile } from "./visits.ts";

const PHASE_LABELS = { arrange: "Arrange", act: "Act", assert: "Assert" };

const GRAPH = {
	nodeWidth: 200,
	nodeHeight: 34,
	rowGap: 12,
	columnGap: 120,
	padding: 16,
	labelCharWidth: 7.6,
	sublabelCharWidth: 6.2,
};

export interface FeatureDoc {
	config: FeatureConfig;
	modules: ModuleDoc[];
	specs: SpecDoc[];
	routes: RouteCoverage[];
}

export interface PageContext {
	features: FeatureDoc[];
	staticAssetsUrl: string;
	coverage: Coverage;
}

/** The landing page: every feature with what it has documented. */
export function renderIndexPage(context: PageContext) {
	const { features } = context;

	return shell({
		title: "sendou.ink living docs",
		active: null,
		context,
		body: `<main class="index">
	<div class="index-head">
		<h1>Living docs</h1>
		<p class="muted">Generated from the core modules (<code>app/features/*/core/Module.ts</code>), the e2e specs (<code>e2e/*.spec.ts</code>) and <code>app/routes.ts</code>. Regenerate with <code>pnpm run docs:living</code>, refresh route coverage and screenshots with <code>pnpm run docs:living:capture</code>. Search with <kbd>⌘K</kbd>.</p>
	</div>
	<div class="feature-grid">${features
		.map((feature) => {
			const testCount = testsOf(feature).length;
			return `<a class="feature-card" href="${featurePageFile(feature.config.id)}">
			${featureIcon(feature.config, context, 40)}
			<span class="feature-card-label">${escapeHtml(feature.config.label)}</span>
			<span class="feature-card-stats">${[
				feature.modules.length > 0
					? count(feature.modules.length, "module")
					: null,
				testCount > 0 ? count(testCount, "e2e test") : null,
				feature.routes.length > 0 && context.coverage.hasCapture
					? `${visitedRoutes(feature).length}/${count(feature.routes.length, "route")} visited`
					: null,
			]
				.filter(Boolean)
				.map((stat) => `<span>${stat}</span>`)
				.join("")}</span>
		</a>`;
		})
		.join("")}</div>
</main>`,
	});
}

/** One feature's page: its modules and e2e tests. */
export function renderFeaturePage(feature: FeatureDoc, context: PageContext) {
	const { label } = feature.config;
	const exportCount = feature.modules.reduce(
		(sum, module) => sum + module.types.length + module.values.length,
		0,
	);
	const tests = testsOf(feature);
	const defaultView =
		feature.modules.length > 0
			? "modules"
			: tests.length > 0
				? "e2e"
				: "routes";
	const refs = new Map(feature.specs.flatMap((spec) => [...spec.refs]));

	return shell({
		title: `${label} · sendou.ink living docs`,
		active: feature.config.id,
		context,
		body: `<main data-default-view="${defaultView}">
	<div class="feature-head">
		${featureIcon(feature.config, context, 48)}
		<div>
			<h1>${escapeHtml(label)}</h1>
			<p class="stats">${count(feature.modules.length, "module")} · ${count(exportCount, "export")} · ${count(tests.length, "e2e test")} · ${count(feature.routes.length, "route")}</p>
		</div>
		<div class="view-switch">
			${feature.modules.length > 0 ? `<a href="#modules" data-view-tab="modules">Modules</a>` : ""}
			${tests.length > 0 ? `<a href="#e2e" data-view-tab="e2e">E2E tests</a>` : ""}
			${feature.routes.length > 0 ? `<a href="#routes" data-view-tab="routes">Routes</a>` : ""}
		</div>
	</div>
	${feature.modules.length > 0 ? renderModulesView(feature) : ""}
	${tests.length > 0 ? renderE2eView(feature, context) : ""}
	${feature.routes.length > 0 ? renderRoutesView(feature, context) : ""}
</main>
${[...refs].map(([id, ref]) => renderRefTemplate(id, ref)).join("\n")}`,
	});
}

function shell({
	title,
	active,
	context,
	body,
}: {
	title: string;
	active: string | null;
	context: PageContext;
	body: string;
}) {
	return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<style>${STYLES}
${Object.entries(KNOWN_USERS)
	.map(([key, user]) => `[data-actor="${key}"] { --actor: ${user.color}; }`)
	.join("\n")}
</style>
</head>
<body>
<header class="topbar">
	<a class="brand" href="index.html">sendou.ink <span>living docs</span></a>
	<button type="button" class="search-button" data-open-search>Search <kbd>⌘K</kbd></button>
	<nav class="feature-tabs">
		${context.features
			.map(
				(feature) =>
					`<a class="feature-tab" href="${featurePageFile(feature.config.id)}"${feature.config.id === active ? ` aria-current="page"` : ""}>${featureIcon(feature.config, context, 20)}${escapeHtml(feature.config.label)}</a>`,
			)
			.join("")}
	</nav>
</header>
${body}
<div class="tooltip" role="tooltip" hidden></div>
<dialog class="search-dialog" aria-label="Search">
	<input type="search" placeholder="Search features, modules, exports, tests, routes…" autocomplete="off" spellcheck="false">
	<ul class="search-results" role="listbox"></ul>
	<p class="search-hint muted"><kbd>↑</kbd> <kbd>↓</kbd> to move, <kbd>Enter</kbd> to open, <kbd>Esc</kbd> to close</p>
</dialog>
<dialog class="lightbox" aria-label="Screenshot"><img alt=""><p class="lightbox-caption"></p></dialog>
<script>${SCRIPT}</script>
</body>
</html>
`;
}

function renderModulesView(feature: FeatureDoc) {
	return `<div class="view" data-view="modules" hidden>
		<aside class="sidebar">
			<h4>Modules</h4>
			<ul class="toc">${feature.modules
				.map(
					(module) =>
						`<li><a href="#modules/${anchor(module.name)}">${escapeHtml(module.name)}</a><ul>${[
							...module.types,
							...module.values,
						]
							.map(
								(exported) =>
									`<li><a href="#modules/${exportAnchor(module.name, exported)}"><span class="kind-dot kind-${exported.kind}"></span>${escapeHtml(exported.name)}</a></li>`,
							)
							.join("")}</ul></li>`,
				)
				.join("")}</ul>
		</aside>
		<div class="content">
			${renderDependencyGraph(feature)}
			${feature.modules.map(renderModule).join("")}
		</div>
	</div>`;
}

function renderE2eView(feature: FeatureDoc, context: PageContext) {
	const actors = testsOf(feature).flatMap((test) => test.actors);
	const knownActors = new Map(
		actors
			.filter((actor) => KNOWN_USERS[actor.key])
			.map((actor) => [actor.label, actor]),
	);
	const hasOtherActors = actors.some((actor) => !KNOWN_USERS[actor.key]);

	return `<div class="view" data-view="e2e" hidden>
		<aside class="sidebar">
			${
				actors.length > 0
					? `<h4>Users</h4>
			<ul class="legend">${[...knownActors.values()]
				.map(
					(actor) =>
						`<li style="--actor: ${actor.color}"><span class="avatar">${escapeHtml(initials(actor.label))}</span>${escapeHtml(actor.label)}<small>${escapeHtml(actor.key)}</small></li>`,
				)
				.join("")}</ul>
			${hasOtherActors ? `<p class="legend-note">Users a test creates itself are coloured per test.</p>` : ""}`
					: ""
			}
			<h4>Phases</h4>
			<ul class="legend phases">
				<li class="phase-arrange"><span class="phase-icon"></span>Arrange <small>data setup</small></li>
				<li class="phase-act"><span class="phase-icon"></span>Act <small>what the user does</small></li>
				<li class="phase-assert"><span class="phase-icon"></span>Assert <small>what is expected</small></li>
			</ul>
			<label class="toggle"><input type="checkbox" data-toggle-code> Show code of each step</label>
			${testsOf(feature).some((test) => test.chapters.some((chapter) => chapter.title)) ? `<label class="toggle"><input type="checkbox" data-toggle-outline> Only step titles</label>` : ""}
			<h4>Tests</h4>
			<ul class="toc">${feature.specs
				.flatMap((spec) => spec.groups.map((group) => ({ spec, group })))
				.map(
					({ spec, group }) =>
						`<li class="toc-depth-${Math.max(group.titlePath.length, 1)}"><span class="toc-group">${escapeHtml(group.titlePath.at(-1) ?? path.basename(spec.path))}</span>${
							group.tests.length > 0
								? `<ul>${group.tests
										.map(
											(test) =>
												`<li><a href="#e2e/${testAnchor(spec.path, group.name, test)}">${escapeHtml(test.name)}</a></li>`,
										)
										.join("")}</ul>`
								: ""
						}</li>`,
				)
				.join("")}</ul>
		</aside>
		<div class="content">
			${feature.specs.map((spec) => renderSpec(spec, context)).join("")}
		</div>
	</div>`;
}

function renderModule(module: ModuleDoc) {
	const isServer = module.name.endsWith(".server");
	const displayName = module.name.replace(/\.server$/, "");
	const usedBy = module.dependents
		.map(
			(group) =>
				`<span class="chip kind-${group.kind}">${count(group.items.length, group.singular, group.label.toLowerCase())}</span>`,
		)
		.join("");

	return `<article class="module" id="modules/${anchor(module.name)}">
	<header class="module-head">
		<h2>${escapeHtml(displayName)}</h2>
		${isServer ? `<span class="badge">server</span>` : ""}
		${fileLink(module.path, 1, module.path)}
	</header>
	${
		module.overview
			? `<div class="overview">${markdown(module.overview)}</div>`
			: `<p class="missing">No overview comment at the top of the file.</p>`
	}
	<dl class="module-facts">
		<dt>Imports</dt><dd>${
			module.dependencies.length > 0
				? module.dependencies
						.map(
							(dependency) =>
								`<span class="chip">${escapeHtml(moduleLabel(dependency))}</span>`,
						)
						.join("")
				: `<span class="muted">no other modules</span>`
		}</dd>
		<dt>Used by</dt><dd>${usedBy || `<span class="muted">nothing outside tests</span>`}</dd>
	</dl>
	${
		module.types.length > 0
			? `<h3 class="section-title">Types</h3>${module.types.map((exported) => renderExport(exported, module)).join("")}`
			: ""
	}
	${
		module.values.length > 0
			? `<h3 class="section-title">Functions &amp; values</h3>${module.values.map((exported) => renderExport(exported, module)).join("")}`
			: ""
	}
	${
		module.otherUnitTests.length > 0
			? `<h3 class="section-title">Other unit tests</h3>${renderUnitTests(module.otherUnitTests)}`
			: ""
	}
	${
		module.testOnlyExports.length > 0
			? `<p class="muted test-only">Not shown, only used by tests: ${module.testOnlyExports.map((name) => `<code>${escapeHtml(name)}</code>`).join(", ")}</p>`
			: ""
	}
</article>`;
}

function renderExport(exported: ExportDoc, module: ModuleDoc) {
	return `<div class="export" id="modules/${exportAnchor(module.name, exported)}">
	<div class="export-head">
		<span class="kind kind-${exported.kind}">${exported.kind}</span>
		<code class="export-name">${escapeHtml(exported.name)}</code>
		${exported.doc ? "" : `<span class="warn" title="Module functions should always have JSDoc">no JSDoc</span>`}
		${fileLink(module.path, exported.line, `:${exported.line}`)}
	</div>
	${exported.doc?.description ? `<div class="doc">${markdown(exported.doc.description)}</div>` : ""}
	${
		exported.doc && exported.doc.tags.length > 0
			? `<ul class="doc-tags">${exported.doc.tags.map((tag) => `<li><span>@${escapeHtml(tag.tag)}</span> ${markdown(tag.text)}</li>`).join("")}</ul>`
			: ""
	}
	<pre class="code">${highlight(exported.signature)}</pre>
	${exported.unitTests.length > 0 ? renderUnitTests(exported.unitTests) : ""}
	${renderUsages(exported.usages)}
</div>`;
}

function renderUnitTests(tests: UnitTestCase[]) {
	const testLink = (test: UnitTestCase, label: string) =>
		`<a href="${githubUrl(test.file, test.line)}">${escapeHtml(label)}</a>${test.caseCount ? ` <span class="muted">× ${test.caseCount}</span>` : ""}`;

	return `<div class="unit-tests">
	<div class="unit-tests-title">Unit tests</div>
	<ul class="unit-test-list">${groupByLeadingWord(tests)
		.map(({ heading, cases }) =>
			heading
				? `<li class="unit-test-group"><span class="unit-test-heading">${escapeHtml(heading)}</span><ul>${cases
						.map(({ test, rest }) => `<li>${testLink(test, rest)}</li>`)
						.join("")}</ul></li>`
				: `<li>${testLink(cases[0].test, cases[0].test.name)}</li>`,
		)
		.join("")}</ul>
</div>`;
}

/** Tests sharing their first word ("accepts …", "rejects …") grouped under it, in order of first appearance. */
function groupByLeadingWord(tests: UnitTestCase[]) {
	const groups = new Map<string, Array<{ test: UnitTestCase; rest: string }>>();

	for (const test of tests) {
		const match = test.name.match(/^(.*? › )?(\S+) (.+)$/);
		const key = match ? `${match[1] ?? ""}${match[2]}` : test.name;
		groups.set(key, [
			...(groups.get(key) ?? []),
			{ test, rest: match?.[3] ?? test.name },
		]);
	}

	return [...groups].map(([heading, cases]) => ({
		heading: cases.length > 1 ? heading : null,
		cases,
	}));
}

function renderUsages(groups: UsageGroup[]) {
	if (groups.length === 0) {
		return `<div class="usages"><span class="muted">Only used inside the module</span></div>`;
	}

	return `<div class="usages">${groups
		.map(
			(group) =>
				`<div class="usage-row"><span class="usage-kind kind-${group.kind}">${escapeHtml(group.label)}</span><span class="usage-files">${group.items
					.map((item) =>
						fileLink(
							item.file,
							item.line,
							usageLabel(item.file),
							"chip file-chip",
						),
					)
					.join("")}</span></div>`,
		)
		.join("")}</div>`;
}

function renderDependencyGraph(feature: FeatureDoc) {
	const modulePaths = new Set(feature.modules.map((module) => module.path));
	const dependencies = [
		...new Set(
			feature.modules.flatMap((module) =>
				module.dependencies.filter(
					(dependency) => !modulePaths.has(dependency),
				),
			),
		),
	];

	const consumerNodes = new Map<
		string,
		{ label: string; sublabel: string; kind: string }
	>();
	const consumerEdges: Array<{ from: string; to: string }> = [];
	const internalEdges: Array<{ from: string; to: string }> = [];

	for (const module of feature.modules) {
		for (const dependency of module.dependencies) {
			if (modulePaths.has(dependency)) {
				internalEdges.push({ from: dependency, to: module.path });
			}
		}

		for (const group of module.dependents) {
			if (group.kind === "module") {
				for (const item of group.items) {
					if (modulePaths.has(item.file)) continue;
					consumerNodes.set(item.file, {
						label: moduleLabel(item.file),
						sublabel: featureOf(item.file),
						kind: "module",
					});
					consumerEdges.push({ from: module.path, to: item.file });
				}
				continue;
			}

			const key = `kind:${group.kind}`;
			const total = new Set(
				feature.modules.flatMap((candidate) =>
					candidate.dependents
						.filter((other) => other.kind === group.kind)
						.flatMap((other) => other.items.map((item) => item.file)),
				),
			).size;
			consumerNodes.set(key, {
				label: group.label,
				sublabel: count(total, "file"),
				kind: group.kind,
			});
			consumerEdges.push({ from: module.path, to: key });
		}
	}

	const columns = [
		dependencies.map((dependency) => ({
			id: dependency,
			label: moduleLabel(dependency),
			sublabel: featureOf(dependency),
			kind: "dependency",
		})),
		feature.modules.map((module) => ({
			id: module.path,
			label: module.name,
			sublabel: count(module.types.length + module.values.length, "export"),
			kind: "self",
		})),
		[...consumerNodes].map(([id, node]) => ({ id, ...node })),
	];

	const rows = Math.max(...columns.map((column) => column.length), 1);
	const height =
		GRAPH.padding * 2 +
		rows * (GRAPH.nodeHeight + GRAPH.rowGap) -
		GRAPH.rowGap +
		24;
	const width = GRAPH.padding * 2 + GRAPH.nodeWidth * 3 + GRAPH.columnGap * 2;
	const positions = new Map<string, { x: number; y: number }>();

	const nodesSvg = columns
		.flatMap((column, columnIndex) => {
			const columnHeight =
				column.length * (GRAPH.nodeHeight + GRAPH.rowGap) - GRAPH.rowGap;
			const top =
				24 +
				GRAPH.padding +
				(height - 24 - GRAPH.padding * 2 - columnHeight) / 2;
			const x =
				GRAPH.padding + columnIndex * (GRAPH.nodeWidth + GRAPH.columnGap);

			return column.map((node, rowIndex) => {
				const y = top + rowIndex * (GRAPH.nodeHeight + GRAPH.rowGap);
				positions.set(node.id, { x, y });

				return `<g class="node node-${node.kind}" data-node="${escapeHtml(node.id)}">
				<rect x="${x}" y="${y}" width="${GRAPH.nodeWidth}" height="${GRAPH.nodeHeight}" rx="8"/>
				<text x="${x + 12}" y="${y + 21}"><tspan class="node-label">${escapeHtml(node.label)}</tspan><tspan class="node-sublabel" dx="8">${escapeHtml(fitSublabel(node.label, node.sublabel))}</tspan></text>
			</g>`;
			});
		})
		.join("");

	const edge = (from: string, to: string, internal = false) => {
		const source = positions.get(from);
		const target = positions.get(to);
		if (!source || !target) return "";

		if (internal) {
			const x = source.x;
			const y1 = source.y + GRAPH.nodeHeight / 2;
			const y2 = target.y + GRAPH.nodeHeight / 2;
			return `<path class="edge" data-from="${escapeHtml(from)}" data-to="${escapeHtml(to)}" d="M${x} ${y1} C${x - 40} ${y1}, ${x - 40} ${y2}, ${x} ${y2}" marker-end="url(#arrow)"/>`;
		}

		const x1 = source.x + GRAPH.nodeWidth;
		const y1 = source.y + GRAPH.nodeHeight / 2;
		const x2 = target.x;
		const y2 = target.y + GRAPH.nodeHeight / 2;
		const bend = GRAPH.columnGap / 2;
		return `<path class="edge" data-from="${escapeHtml(from)}" data-to="${escapeHtml(to)}" d="M${x1} ${y1} C${x1 + bend} ${y1}, ${x2 - bend} ${y2}, ${x2 - 4} ${y2}" marker-end="url(#arrow)"/>`;
	};

	const edgesSvg = [
		...feature.modules.flatMap((module) =>
			module.dependencies
				.filter((dependency) => !modulePaths.has(dependency))
				.map((dependency) => edge(dependency, module.path)),
		),
		...internalEdges.map(({ from, to }) => edge(from, to, true)),
		...consumerEdges.map(({ from, to }) => edge(from, to)),
	].join("");

	const headingX = (columnIndex: number) =>
		GRAPH.padding + columnIndex * (GRAPH.nodeWidth + GRAPH.columnGap);

	return `<figure class="graph-card">
	<figcaption>Who imports who <span class="muted">· hover a node</span></figcaption>
	<div class="graph-scroll">
	<svg class="graph" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="Module dependency graph">
		<defs><marker id="arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L8 4 L0 8 z" class="arrowhead"/></marker></defs>
		<text class="column-title" x="${headingX(0)}" y="${GRAPH.padding}">Depends on</text>
		<text class="column-title" x="${headingX(1)}" y="${GRAPH.padding}">${escapeHtml(feature.config.label)} modules</text>
		<text class="column-title" x="${headingX(2)}" y="${GRAPH.padding}">Used by</text>
		${edgesSvg}
		${nodesSvg}
	</svg>
	</div>
</figure>`;
}

/** Shortens a graph node's sublabel so it fits next to the label, widths estimated per character. */
function fitSublabel(label: string, sublabel: string) {
	const room = Math.floor(
		(GRAPH.nodeWidth - 24 - label.length * GRAPH.labelCharWidth) /
			GRAPH.sublabelCharWidth,
	);
	if (room <= 2) return "";
	return sublabel.length > room ? `${sublabel.slice(0, room - 1)}…` : sublabel;
}

function renderSpec(spec: SpecDoc, context: PageContext) {
	return `<div class="spec">
	<div class="spec-head">${fileLink(spec.path, 1, spec.path)}</div>
	${spec.groups
		.map(
			(group) => `<section class="test-group">
		${group.name ? `<h2 class="group-title group-depth-${group.titlePath.length}">${escapeHtml(group.titlePath.at(-1) ?? group.name)}</h2>` : ""}
		${group.doc ? `<div class="group-doc">${markdown(group.doc)}</div>` : ""}
		${group.options ? `<p class="group-options">Runs with <code>${escapeHtml(group.options)}</code></p>` : ""}
		${group.tests.map((test) => renderTest(test, group.name, spec, context)).join("")}
	</section>`,
		)
		.join("")}
</div>`;
}

function renderTest(
	test: TestDoc,
	groupName: string | null,
	spec: SpecDoc,
	context: PageContext,
) {
	const titledChapters = test.chapters.filter((chapter) => chapter.title);
	const storyboard =
		titledChapters.length > 0
			? titledChapters.map((chapter) => ({
					line: chapter.line,
					plainLabel: chapter.title!,
				}))
			: test.chapters
					.flatMap((chapter) => chapter.segments)
					.flatMap((segment) => segment.items)
					.filter((item): item is Divider => item.kind === "divider");
	const renderedRoutes = context.coverage
		.routesOfTest(test)
		.filter((route) => !route.isLayout);

	return `<article class="test" id="e2e/${testAnchor(spec.path, groupName, test)}">
	<header class="test-head">
		<h3>${test.modifier && test.modifier !== "hook" ? `<span class="badge">${escapeHtml(test.modifier)}</span> ` : ""}${escapeHtml(test.name)}</h3>
		<div class="test-meta">
			${test.actors.map((actor) => `<span class="user" style="--actor: ${actor.color}">${escapeHtml(actor.label)}</span>`).join("")}
			${fileLink(spec.path, test.line, `${path.basename(spec.path)}:${test.line}`)}
		</div>
	</header>
	${test.doc ? `<div class="test-doc">${markdown(test.doc)}</div>` : ""}
	${
		renderedRoutes.length > 0
			? `<p class="test-routes">Renders ${renderedRoutes.map((route) => `<a class="route-chip" href="${featurePageFile(routeFeature(route) ?? "")}#routes/${routeAnchor(route)}">${escapeHtml(route.path)}</a>`).join("")}</p>`
			: ""
	}
	${
		storyboard.length > 0
			? `<div class="storyboard">${storyboard.map((shot) => screenshotButton(spec, shot, "storyboard-frame")).join("")}</div>`
			: ""
	}
	<div class="chapters">${test.chapters.map((chapter) => renderChapter(chapter, titledChapters.indexOf(chapter), spec)).join("")}</div>
	<details class="source"><summary>Source</summary><pre class="code">${highlight(test.source)}</pre></details>
</article>`;
}

function renderChapter(chapter: Chapter, titledIndex: number, spec: SpecDoc) {
	const segments = `<div class="segments">${chapter.segments.map((segment) => renderSegment(segment, spec)).join("")}</div>`;
	if (!chapter.title) return segments;

	return `<section class="chapter">
	<h4 class="chapter-title"><span class="chapter-number">${titledIndex + 1}</span><span class="chapter-text">${escapeHtml(chapter.title)}</span>${screenshotButton(spec, { line: chapter.line, plainLabel: chapter.title }, "divider-shot")}</h4>
	${segments}
</section>`;
}

function renderSegment(segment: Segment, spec: SpecDoc) {
	const lane = segment.actor
		? `<div class="lane" title="Logged in as ${escapeHtml(segment.actor.label)} (${escapeHtml(segment.actor.key)})"><div class="lane-sticky"><span class="avatar">${escapeHtml(initials(segment.actor.label))}</span><span class="lane-name">${escapeHtml(segment.actor.label)}</span></div></div>`
		: `<div class="lane"><div class="lane-sticky"><span class="lane-name">Setup</span></div></div>`;

	return `<div class="segment ${segment.actor ? "segment-actor" : "segment-setup"}"${
		segment.actor ? ` style="--actor: ${segment.actor.color}"` : ""
	}>
	${lane}
	<div class="segment-body">${segment.items.map((item) => renderItem(item, spec)).join("")}</div>
</div>`;
}

function renderItem(item: Divider | Run, spec: SpecDoc) {
	if (item.kind === "divider") {
		return `<div class="divider"><span class="divider-label">${item.html}</span>${screenshotButton(spec, item, "divider-shot")}</div>`;
	}

	return `<div class="run phase-${item.phase}">
	<div class="run-label">${PHASE_LABELS[item.phase]}</div>
	<ol class="steps">${item.steps.map(renderStep).join("")}</ol>
</div>`;
}

function renderStep(step: Step): string {
	return `<li class="step phase-${step.phase}${step.isNaming ? " step-naming" : ""}">
	${step.notes.map((note) => `<div class="note">${markdown(note)}</div>`).join("")}
	<div class="step-line"><span class="phase-icon"></span><span class="step-text">${step.html}</span></div>
	<pre class="code step-code">${highlight(step.code)}</pre>
	${step.children.length > 0 ? `<ol class="steps nested">${step.children.map(renderStep).join("")}</ol>` : ""}
</li>`;
}

function renderRefTemplate(id: string, ref: SourceRef) {
	return `<template data-ref-id="${escapeHtml(id)}" data-href="${githubUrl(ref.file, ref.line)}">
	<div class="tooltip-head"><code>${escapeHtml(ref.title)}</code><span>${escapeHtml(`${ref.file}:${ref.line}`)}</span></div>
	${ref.doc ? `<div class="tooltip-doc">${markdown(ref.doc)}</div>` : `<div class="tooltip-doc muted">No JSDoc</div>`}
	${ref.code ? `<pre class="code">${highlight(ref.code)}</pre>` : ""}
</template>`;
}

/** A screenshot from the last capture, removed by the browser when that capture didn't take it. */
function screenshotButton(
	spec: SpecDoc,
	shot: { line: number; plainLabel: string },
	className: string,
) {
	const src = screenshotFile(spec.path, shot.line).replace(
		/^docs\/living\//,
		"",
	);

	return `<button type="button" class="${className}" data-shot="${src}" data-caption="${escapeHtml(shot.plainLabel)}"><img src="${src}" alt="${escapeHtml(shot.plainLabel)}" loading="lazy" onerror="this.parentElement.remove()">${className === "storyboard-frame" ? `<span>${escapeHtml(shot.plainLabel)}</span>` : ""}</button>`;
}

function renderRoutesView(feature: FeatureDoc, context: PageContext) {
	const visited = visitedRoutes(feature);

	return `<div class="view" data-view="routes" hidden>
		<aside class="sidebar">
			<h4>Coverage</h4>
			${
				context.coverage.hasCapture
					? `<p class="coverage"><strong>${visited.length}</strong> of ${count(feature.routes.length, "route")} rendered by an e2e test</p>
			<p class="legend-note">From the last <code>pnpm run docs:living:capture</code>.</p>`
					: `<p class="legend-note">No capture yet, run <code>pnpm run docs:living:capture</code>.</p>`
			}
			<h4>Routes</h4>
			<ul class="toc route-toc">${feature.routes
				.map(
					({ route, visitedBy }) =>
						`<li><a href="#routes/${routeAnchor(route)}"><span class="kind-dot ${visitedBy.length > 0 ? "is-visited" : "is-unvisited"}"></span>${escapeHtml(route.path)}</a></li>`,
				)
				.join("")}</ul>
		</aside>
		<div class="content">
			<div class="routes">${feature.routes
				.map(({ route, visitedBy }) => {
					const kind = route.isLayout
						? "layout"
						: route.hasComponent
							? "page"
							: "resource";
					return `<article class="route" id="routes/${routeAnchor(route)}">
				<div class="route-head">
					<code class="route-path">${routePathHtml(route.path)}</code>
					<span class="badge">${kind}${route.isIndex ? " · index" : ""}</span>
					${route.hasLoader ? `<span class="badge badge-loader">loader</span>` : ""}
					${route.hasAction ? `<span class="badge badge-action">action</span>` : ""}
					${fileLink(route.file, 1, path.basename(route.file))}
				</div>
				${
					visitedBy.length > 0
						? `<ul class="route-tests">${visitedBy.map((test) => `<li><a href="${test.href}">${escapeHtml(test.name)}</a></li>`).join("")}</ul>`
						: context.coverage.hasCapture
							? `<p class="warn-text">No e2e test renders this route</p>`
							: ""
				}
			</article>`;
				})
				.join("")}</div>
		</div>
	</div>`;
}

function visitedRoutes(feature: FeatureDoc) {
	return feature.routes.filter(({ visitedBy }) => visitedBy.length > 0);
}

function routePathHtml(routePath: string) {
	return escapeHtml(routePath).replace(
		/(:[\w-]+\??|\*)/g,
		`<span class="route-param">$1</span>`,
	);
}

function featureIcon(
	feature: FeatureConfig,
	context: PageContext,
	size: number,
) {
	if (!feature.navIcon) {
		return `<span class="feature-icon letter-icon" style="--size: ${size}px" aria-hidden="true">${escapeHtml(feature.label.charAt(0))}</span>`;
	}

	return `<img class="feature-icon" src="${context.staticAssetsUrl}/img/layout/${feature.navIcon}.avif" alt="" width="${size}" height="${size}" loading="lazy">`;
}

function testsOf(feature: FeatureDoc) {
	return feature.specs.flatMap((spec) =>
		spec.groups.flatMap((group) => group.tests),
	);
}

function fileLink(
	file: string,
	line: number,
	label: string,
	className = "file-link",
) {
	return `<a class="${className}" href="${githubUrl(file, line)}" title="${escapeHtml(file)}:${line}">${escapeHtml(label)}</a>`;
}

function usageLabel(file: string) {
	return `${featureOf(file)}/${path.basename(file)}`;
}

function moduleLabel(file: string) {
	return path.basename(file).replace(/\.tsx?$/, "");
}

function featureOf(file: string) {
	return (
		file.match(/^app\/features\/([^/]+)\//)?.[1] ??
		file.split("/").slice(0, 2).join("/")
	);
}

function count(amount: number, singular: string, plural = `${singular}s`) {
	return `${amount} ${amount === 1 ? singular : plural}`;
}

function initials(label: string) {
	return label
		.replace(/[^A-Za-z0-9 ]/g, "")
		.split(" ")
		.map((word) => word[0])
		.join("")
		.slice(0, 2)
		.toUpperCase();
}

/** Paragraphs and `inline code`, enough for JSDoc and comments. */
function markdown(text: string) {
	return text
		.split(/\n\s*\n/)
		.map(
			(paragraph) =>
				`<p>${escapeHtml(paragraph.replace(/\s*\n\s*/g, " ")).replace(/`([^`]+)`/g, "<code>$1</code>")}</p>`,
		)
		.join("");
}
