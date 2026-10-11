import { useTranslation } from "react-i18next";
import { useLoaderData } from "react-router";
import { Redirect } from "~/components/Redirect";
import { StreamHelpDialog } from "~/features/live-streams/components/StreamHelpDialog";
import * as LiveStream from "~/features/live-streams/core/LiveStream";
import { useTournament } from "~/features/tournament/tournament-context";
import { tournamentRegisterPage } from "~/utils/urls";
import { TournamentStream } from "../components/TournamentStream";
import type { TournamentStreamsLoaderData } from "../loaders/to.$id.streams.server";
import styles from "./to.$id.streams.module.css";

export { loader } from "../loaders/to.$id.streams.server";

export default function TournamentStreamsPage() {
	const { t } = useTranslation(["tournament"]);
	const tournament = useTournament();
	const { streams } = useLoaderData<TournamentStreamsLoaderData>();
	const streamers = LiveStream.groupByStreamer(streams);

	if (!tournament.hasStarted || tournament.everyBracketOver) {
		return <Redirect to={tournamentRegisterPage(tournament.ctx.id)} />;
	}

	if (streams.length === 0) {
		return (
			<div className="stack md">
				<div className="text-center text-lg font-semi-bold text-lighter">
					{t("tournament:streams.none")}
				</div>
				<StreamHelpDialog />
			</div>
		);
	}

	// TODO: link to user page, later tournament team page?
	return (
		<div className="stack lg">
			<div className={styles.streamsGrid}>
				{streamers.map((streamer) => (
					<TournamentStream
						key={LiveStream.key(streamer.streams[0])}
						streamer={streamer}
					/>
				))}
			</div>
			<StreamHelpDialog />
		</div>
	);
}
