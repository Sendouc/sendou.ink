import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { Redirect } from "~/components/Redirect";
import { tournamentRegisterPage } from "~/utils/urls";
import * as TournamentRepository from "../TournamentRepository.server";
import { streamsByTournamentId } from "../core/streams.server";
import { tournamentIdFromParams } from "../tournament-utils";
import { useTournament } from "./to.$id";
import { TournamentStream } from "../components/TournamentStream";

export type TournamentStreamsLoader = typeof loader;

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const tournamentId = tournamentIdFromParams(params);

  return {
    streams: await streamsByTournamentId({
      tournamentId,
      castTwitchAccounts:
        await TournamentRepository.findCastTwitchAccountsByTournamentId(
          tournamentId,
        ),
    }),
  };
};

export default function TournamentStreamsPage() {
  const { t } = useTranslation(["tournament"]);
  const tournament = useTournament();
  const data = useLoaderData<typeof loader>();

  if (!tournament.hasStarted || tournament.everyBracketOver) {
    return <Redirect to={tournamentRegisterPage(tournament.ctx.id)} />;
  }

  if (data.streams.length === 0) {
    return (
      <div className="text-center text-lg font-semi-bold text-lighter">
        {t("tournament:streams.none")}
      </div>
    );
  }

  // TODO: link to user page, later tournament team page?
  return (
    <div className="stack horizontal lg flex-wrap justify-center">
      {data.streams.map((stream) => (
        <TournamentStream key={stream.twitchUserName} stream={stream} />
      ))}
    </div>
  );
}
