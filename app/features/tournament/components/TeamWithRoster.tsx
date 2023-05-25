import { Link } from "@remix-run/react";
import type { FindTeamsByTournamentIdItem } from "../queries/findTeamsByTournamentId.server";
import { Avatar } from "~/components/Avatar";
import { userPage } from "~/utils/urls";
import { ModeImage, StageImage } from "~/components/Image";
import clsx from "clsx";

export function TeamWithRoster({
  team,
  seed,
  teamPageUrl,
}: {
  team: Pick<FindTeamsByTournamentIdItem, "members" | "name" | "mapPool">;
  seed?: number;
  teamPageUrl?: string;
}) {
  return (
    <div>
      <div className="tournament__team-with-roster">
        <div className="tournament__team-with-roster__name">
          {seed ? (
            <span className="tournament__team-with-roster__seed">#{seed}</span>
          ) : null}{" "}
          {teamPageUrl ? <Link to={teamPageUrl}>{team.name}</Link> : team.name}
        </div>
        <ul className="tournament__team-with-roster__members">
          {team.members.map((member) => (
            <li
              key={member.userId}
              className="tournament__team-with-roster__member"
            >
              <Avatar user={member} size="xxs" />
              <Link
                to={userPage(member)}
                className="tournament__team-member-name"
              >
                {member.discordName}{" "}
                {member.isOwner ? (
                  <span className="tournament__team-member-name__captain">
                    (C)
                  </span>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      {team.mapPool && team.mapPool.length > 0 ? (
        <TeamMapPool mapPool={team.mapPool} />
      ) : null}
    </div>
  );
}

function TeamMapPool({
  mapPool,
}: {
  mapPool: NonNullable<FindTeamsByTournamentIdItem["mapPool"]>;
}) {
  return (
    <div
      className={clsx("tournament__team-with-roster__map-pool", {
        "tournament__team-with-roster__map-pool__3-columns":
          mapPool.length % 3 === 0,
      })}
    >
      {mapPool.map(({ mode, stageId }, i) => {
        return (
          <div key={i}>
            <StageImage stageId={stageId} width={85} />
            <div className="tournament__team-with-roster__map-pool__mode-info">
              <ModeImage mode={mode} size={16} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
