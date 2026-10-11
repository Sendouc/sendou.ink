import { useTranslation } from "react-i18next";
import { useLoaderData } from "react-router";
import { Redirect } from "~/components/Redirect";
import { StreamsPage } from "~/features/live-streams/components/StreamsPage";
import * as LiveStream from "~/features/live-streams/core/LiveStream";
import { useTournament } from "~/features/tournament/tournament-context";
import { tournamentRegisterPage } from "~/utils/urls";
import { TournamentStream } from "../components/TournamentStream";
import type { TournamentStreamsLoaderData } from "../loaders/to.$id.streams.server";

export { loader } from "../loaders/to.$id.streams.server";

export default function TournamentStreamsPage() {
	const { t } = useTranslation(["tournament"]);
	const tournament = useTournament();
	const { streams } = useLoaderData<TournamentStreamsLoaderData>();

	if (!tournament.hasStarted || tournament.everyBracketOver) {
		return <Redirect to={tournamentRegisterPage(tournament.ctx.id)} />;
	}

	return (
		<StreamsPage navItem="medal" emptyText={t("tournament:streams.none")}>
			{LiveStream.groupByStreamer(streams).map((streamer) => (
				<TournamentStream
					key={LiveStream.key(streamer.streams[0])}
					streamer={streamer}
				/>
			))}
		</StreamsPage>
	);
}
