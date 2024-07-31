import type { SerializeFrom } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import clsx from "clsx";
import type { TournamentBracketLoader } from "../../loaders/to.$id.brackets.server";
import type {
	BracketMatch,
	BracketMatchWithParticipantInfo,
	SingleEliminationBracket,
} from "../../tournament-bracket-types";
import { Match } from "./Match";
import { RoundHeader } from "./RoundHeader";

interface EliminationBracketSideProps {
	rounds: SingleEliminationBracket["rounds"];
	preview: boolean;
	type: "winners" | "losers" | "single";
	isExpanded?: boolean;
}

export function EliminationBracketSide({
	rounds,
	preview,
	type,
	isExpanded,
}: EliminationBracketSideProps) {
	const data = useLoaderData<TournamentBracketLoader>();

	let atLeastOneColumnHidden = false;
	return (
		<div
			className="elim-bracket__container"
			style={{ "--round-count": rounds.length }}
		>
			{rounds.flatMap((round, roundIdx) => {
				const someMatchOngoing = round.matches.some((match) => !match.winner);

				if (
					!isExpanded &&
					// always show at least 2 rounds per side
					roundIdx < rounds.length - 2 &&
					!someMatchOngoing
				) {
					atLeastOneColumnHidden = true;
					return null;
				}

				return (
					<div
						key={round.id}
						className="elim-bracket__round-column"
						data-round-id={round.id}
					>
						<RoundHeader round={round} showInfos={someMatchOngoing} />
						<div
							className={clsx("elim-bracket__round-matches-container", {
								"elim-bracket__round-matches-container__top-bye":
									!atLeastOneColumnHidden &&
									type === "winners" &&
									rounds[0].matches[0].bye,
							})}
						>
							{round.matches.map((match) => (
								<Match
									key={match.id}
									match={matchWithParticipantInfo(match, data.participants)}
									roundNumber={round.number}
									isPreview={preview}
									type={
										round.name === "GRAND_FINALS" ||
										round.name === "BRACKET_RESET"
											? "grands"
											: type === "winners"
												? "winners"
												: type === "losers"
													? "losers"
													: undefined
									}
								/>
							))}
						</div>
					</div>
				);
			})}
		</div>
	);
}

// xxx: to different file
function matchWithParticipantInfo(
	match: BracketMatch,
	mapping: SerializeFrom<TournamentBracketLoader>["participants"],
): BracketMatchWithParticipantInfo {
	return {
		...match,
		participants: match.participants.map((id) =>
			id ? mapping[id] : null,
		) as BracketMatchWithParticipantInfo["participants"],
		predictions: (match.predictions
			? match.predictions.map((id) => mapping[id])
			: undefined) as BracketMatchWithParticipantInfo["predictions"],
	};
}
