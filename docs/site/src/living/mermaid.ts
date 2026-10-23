const drawn: HTMLElement[] = [];
let redrawsOnThemeChange = false;

/** Draws the mermaid source of the elements as diagrams, drawing them again whenever the theme changes. */
export async function drawMermaid(diagrams: HTMLElement[]) {
	const { default: mermaid } = await import("mermaid");

	for (const diagram of diagrams) {
		diagram.dataset.source ??= diagram.textContent ?? "";
	}
	drawn.push(...diagrams);

	const draw = async (nodes: HTMLElement[]) => {
		mermaid.initialize({
			startOnLoad: false,
			theme:
				document.documentElement.dataset.theme === "light" ? "default" : "dark",
		});
		for (const node of nodes) {
			node.removeAttribute("data-processed");
			node.textContent = node.dataset.source ?? "";
		}
		await mermaid.run({ nodes });
	};

	await draw(diagrams);

	if (redrawsOnThemeChange) return;
	redrawsOnThemeChange = true;
	new MutationObserver(() => draw(drawn)).observe(document.documentElement, {
		attributes: true,
		attributeFilter: ["data-theme"],
	});
}
