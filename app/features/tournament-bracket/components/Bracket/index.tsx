import * as React from "react";
import { useDraggable } from "react-use-draggable-scroll";
import { useBracketExpanded } from "~/features/tournament/routes/to.$id";
import type { Bracket as BracketType } from "../../tournament-bracket-types";
import { EliminationBracketSide } from "./Elimination";

export function Bracket({
	bracket,
}: {
	bracket: BracketType;
}) {
	const { bracketExpanded } = useBracketExpanded();

	// xxx: implement
	if (bracket.type === "round_robin") {
		throw new Error("Round Robin brackets are not supported yet");
		// return (
		// 	<BracketContainer>
		// 		<RoundRobinBracket bracket={bracket} />
		// 	</BracketContainer>
		// );
	}

	// xxx: implement
	if (bracket.type === "swiss") {
		throw new Error("Swiss brackets are not supported yet");
		// return (
		// 	<BracketContainer>
		// 		<SwissBracket bracket={bracket} bracketIdx={bracketIdx} />
		// 	</BracketContainer>
		// );
	}

	if (bracket.type === "single_elimination") {
		return (
			<BracketContainer scrollable>
				<EliminationBracketSide
					type="single"
					rounds={bracket.rounds}
					preview={bracket.preview}
					isExpanded={bracketExpanded}
				/>
			</BracketContainer>
		);
	}

	return (
		<BracketContainer scrollable>
			<EliminationBracketSide
				type="winners"
				rounds={bracket.winners}
				preview={bracket.preview}
				isExpanded={bracketExpanded}
			/>
			<EliminationBracketSide
				type="losers"
				rounds={bracket.losers}
				preview={bracket.preview}
				isExpanded={bracketExpanded}
			/>
		</BracketContainer>
	);
}

function BracketContainer({
	children,
	scrollable = false,
}: {
	children: React.ReactNode;
	scrollable?: boolean;
}) {
	if (!scrollable) {
		return (
			<div className="bracket" data-testid="brackets-viewer">
				{children}
			</div>
		);
	}

	return <ScrollableBracketContainer>{children}</ScrollableBracketContainer>;
}

function ScrollableBracketContainer({
	children,
}: {
	children: React.ReactNode;
}) {
	const ref = React.useRef<HTMLDivElement>(
		null,
	) as React.MutableRefObject<HTMLDivElement>;
	const { events } = useDraggable(ref, {
		applyRubberBandEffect: true,
	});

	return (
		<div
			className="bracket scrolling-bracket"
			data-testid="brackets-viewer"
			ref={ref}
			{...events}
		>
			{children}
		</div>
	);
}
