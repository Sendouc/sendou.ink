import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useOutletContext } from "@remix-run/react";
import { streamsByTournamentId } from "../core/streams.server";
import { tournamentIdFromParams } from "../tournament-utils";
import type { TournamentLoaderData } from "./to.$id";
import { Avatar } from "~/components/Avatar";
import { Redirect } from "~/components/Redirect";
import { tournamentRegisterPage, twitchUrl } from "~/utils/urls";
import { UserIcon } from "~/components/icons/User";
import { useTranslation } from "react-i18next";
import { twitchThumbnailUrlToSrc } from "~/modules/twitch/utils";
import * as TournamentRepository from "../TournamentRepository.server";
import { notFoundIfFalsy } from "~/utils/remix";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const tournamentId = tournamentIdFromParams(params);
  const tournament = notFoundIfFalsy(
    await TournamentRepository.findById(tournamentId),
  );

  return {
    streams: await streamsByTournamentId({
      tournamentId,
      castTwitchAccounts: tournament.castTwitchAccounts,
    }),
  };
};

export default function TournamentStreamsPage() {
  const { t } = useTranslation(["tournament"]);
  const parentRouteData = useOutletContext<TournamentLoaderData>();
  const data = useLoaderData<typeof loader>();

  if (!parentRouteData.hasStarted || parentRouteData.hasFinalized) {
    return (
      <Redirect to={tournamentRegisterPage(parentRouteData.tournament.id)} />
    );
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
      {data.streams.map((stream) => {
        const team = parentRouteData.teams.find((team) =>
          team.members.some((m) => m.userId === stream.userId),
        );
        const user = team?.members.find((m) => m.userId === stream.userId);

        return (
          <div key={stream.userId} className="stack sm">
            <a
              href={twitchUrl(stream.twitchUserName)}
              target="_blank"
              rel="noreferrer"
            >
              <img
                alt=""
                src={twitchThumbnailUrlToSrc(stream.thumbnailUrl)}
                width={320}
                height={180}
              />
            </a>
            <div className="stack horizontal justify-between">
              {user && team ? (
                <div className="tournament__stream__user-container">
                  <Avatar size="xxs" user={user} /> {user.discordName}
                  <span className="text-theme-secondary">{team.name}</span>
                </div>
              ) : (
                <div className="tournament__stream__user-container">
                  Cast
                  <span className="text-lighter">{stream.twitchUserName}</span>
                </div>
              )}
              <div className="tournament__stream__viewer-count">
                <UserIcon />
                {stream.viewerCount}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
