import type { SerializeFrom } from "@remix-run/node";
import { Avatar } from "~/components/Avatar";
import { UserIcon } from "~/components/icons/User";
import { twitchThumbnailUrlToSrc } from "~/modules/twitch/utils";
import { twitchUrl } from "~/utils/urls";
import type { TournamentStreamsLoader } from "../routes/to.$id.streams";
import { useTournament } from "../routes/to.$id";

export function TournamentStream({
  stream,
  preview = "large",
}: {
  stream: SerializeFrom<TournamentStreamsLoader>["streams"][number];
  preview?: "small" | "large";
}) {
  const tournament = useTournament();
  const team = tournament.ctx.teams.find((team) =>
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
          width={preview === "small" ? 160 : 320}
          height={preview === "small" ? 90 : 180}
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
}
