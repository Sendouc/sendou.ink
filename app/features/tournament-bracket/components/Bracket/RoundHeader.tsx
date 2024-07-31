import clsx from "clsx";
import type { BracketRound } from "../../tournament-bracket-types";

export function RoundHeader({
	round,
	showInfos,
}: {
	round: BracketRound;
	showInfos?: boolean;
}) {
	const countPrefix = round.maps?.type === "PLAY_ALL" ? "Play all " : "Bo";

	const pickBanSuffix =
		round.maps?.pickBan === "COUNTERPICK"
			? " (C)"
			: round.maps?.pickBan === "BAN_2"
				? " (B)"
				: "";

	// xxx: resolve name
	return (
		<div>
			<div className="elim-bracket__round-header">{round.name}</div>
			{showInfos && round.maps?.count ? (
				<div className="elim-bracket__round-header__infos">
					<div>
						{countPrefix}
						{round.maps?.count}
						{pickBanSuffix}
					</div>
					{round.deadline ? (
						<div
							className={clsx({
								"text-warning": new Date(round.deadline) < new Date(),
							})}
							suppressHydrationWarning
						>
							DL{" "}
							{new Date(round.deadline).toLocaleTimeString("en-US", {
								hour: "numeric",
								minute: "numeric",
							})}
						</div>
					) : null}
				</div>
			) : (
				<div className="elim-bracket__round-header__infos invisible">
					Hidden
				</div>
			)}
		</div>
	);
}
