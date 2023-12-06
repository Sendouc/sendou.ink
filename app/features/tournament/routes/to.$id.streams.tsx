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

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const tournamentId = tournamentIdFromParams(params);

  return {
    streams: await streamsByTournamentId(tournamentId),
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

  const thumbnailUrlToSrc = (url: string) =>
    url.replace("{width}", "640").replace("{height}", "360");

  // TODO: link to user page, later tournament team page?
  return (
    <div className="stack horizontal lg flex-wrap justify-center">
      {data.streams.flatMap((stream) => {
        const team = parentRouteData.teams.find((team) =>
          team.members.some((m) => m.userId === stream.userId),
        );
        const user = team?.members.find((m) => m.userId === stream.userId);

        if (!team || !user) {
          console.error("No team or user found for stream", stream);
          return [];
        }

        return (
          <div key={stream.userId} className="stack sm">
            <a
              href={twitchUrl(stream.twitchUserName)}
              target="_blank"
              rel="noreferrer"
            >
              <img
                alt=""
                src={thumbnailUrlToSrc(stream.thumbnailUrl)}
                width={320}
                height={180}
              />
            </a>
            <div className="stack horizontal justify-between">
              <div className="tournament__stream__user-container">
                <Avatar size="xxs" user={user} /> {user.discordName}
                <span className="tournament__stream__team-name">
                  {team.name}
                </span>
              </div>
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
