import clsx from "clsx";
import { Avatar } from "~/components/Avatar";
import { Placement } from "~/components/Placement";
import { Table } from "~/components/Table";
import type { Bracket } from "~/features/tournament-bracket/core/Bracket";
import { useTournament } from "./to.$id";

export default function TournamentStandingsPage() {
	const tournament = useTournament();

	const bracket = tournament.bracketByIdx(0)!;
	const standings = bracket.standings;

	let lastRenderedPlacement = 0;
	return (
		<div>
			<Table>
				<thead>
					<tr>
						<th>Standing</th>
						<th>Team</th>
						<th>Seed</th>
						<th>SPR</th>
						<th>Matches</th>
					</tr>
				</thead>
				<tbody>
					{standings.map((standing) => {
						const placement =
							lastRenderedPlacement === standing.placement
								? null
								: standing.placement;
						lastRenderedPlacement = standing.placement;

						const teamLogoSrc = tournament.tournamentTeamLogoSrc(standing.team);

						return (
							<tr key={standing.team.id}>
								<td>
									{typeof placement === "number" ? (
										<Placement placement={placement} />
									) : null}{" "}
								</td>
								<td className="stack horizontal sm items-center">
									{teamLogoSrc ? <Avatar size="xxs" url={teamLogoSrc} /> : null}{" "}
									{standing.team.name}
								</td>
								<td>{standing.team.seed}</td>
								<td>0</td>
								<td>
									<MatchHistoryRow
										teamId={standing.team.id}
										bracket={bracket}
									/>
								</td>
							</tr>
						);
					})}
				</tbody>
			</Table>
		</div>
	);
}

// xxx: quite a lot of ! here, some helpers?
function MatchHistoryRow({
	teamId,
	bracket,
}: { teamId: number; bracket: Bracket }) {
	const tournament = useTournament();

	const teamMatches = bracket.data.match.filter(
		(m) =>
			m.opponent1 &&
			m.opponent2 &&
			(m.opponent1?.id === teamId || m.opponent2?.id === teamId),
	);

	return (
		<div className="stack horizontal sm">
			{teamMatches.map((match) => {
				const opponentId = (
					match.opponent1?.id === teamId
						? match.opponent2?.id
						: match.opponent1?.id
				)!;
				const team = tournament.teamById(opponentId)!;

				const result = (
					match.opponent1?.id === teamId
						? match.opponent1.result
						: match.opponent2?.result
				)!;

				return (
					<MatchResultSquare result={result} key={match.id}>
						{team.seed}
					</MatchResultSquare>
				);
			})}
		</div>
	);
}

function MatchResultSquare({
	result,
	children,
}: { result: "win" | "loss"; children: React.ReactNode }) {
	return (
		<div
			className={clsx("tournament__standings__match-result-square", {
				"tournament__standings__match-result-square--win": result === "win",
				"tournament__standings__match-result-square--loss": result === "loss",
			})}
		>
			{children}
		</div>
	);
}
