import clsx from "clsx";
import type { TournamentRoundMaps } from "~/db/tables";
import { useAutoRerender } from "~/hooks/useAutoRerender";
import { useIsMounted } from "~/hooks/useIsMounted";
import { useDeadline } from "./useDeadline";

export function RoundHeader({
	roundId,
	name,
	bestOf,
	showInfos,
	maps,
}: {
	roundId: number;
	name: string;
	bestOf?: number;
	showInfos?: boolean;
	maps?: TournamentRoundMaps | null;
}) {
	const hasDeadline = ![
		"WB Finals",
		"Grand Finals",
		"Bracket Reset",
		"Finals",
	].includes(name);

	const countPrefix = maps?.type === "PLAY_ALL" ? "Play all " : "Bo";

	const pickBanSuffix =
		maps?.pickBan === "COUNTERPICK"
			? " (C)"
			: maps?.pickBan === "BAN_2"
				? " (B)"
				: "";

	return (
		<div>
			<div className="elim-bracket__round-header">{name}</div>
			{showInfos && bestOf ? (
				<div className="elim-bracket__round-header__infos">
					<div>
						{countPrefix}
						{bestOf}
						{pickBanSuffix}
					</div>
					{hasDeadline ? <Deadline roundId={roundId} bestOf={bestOf} /> : null}
				</div>
			) : (
				<div className="elim-bracket__round-header__infos invisible">
					Hidden
				</div>
			)}
		</div>
	);
}

function Deadline({ roundId, bestOf }: { roundId: number; bestOf: number }) {
	useAutoRerender("ten seconds");
	const isMounted = useIsMounted();
	const deadline = useDeadline(roundId, bestOf);

	if (!deadline) return null;

	return (
		<div
			className={clsx({
				"text-warning": isMounted && deadline < new Date(),
			})}
		>
			DL{" "}
			{deadline.toLocaleTimeString("en-US", {
				hour: "numeric",
				minute: "numeric",
			})}
		</div>
	);
}
