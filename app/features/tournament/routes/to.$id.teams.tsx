import { Link, useOutletContext } from "@remix-run/react";
import { Avatar } from "~/components/Avatar";
import { ModeImage, StageImage } from "~/components/Image";
import { userPage } from "~/utils/urls";
import type { FindTeamsByTournamentIdItem } from "../queries/findTeamsByTournamentId.server";
import type { TournamentLoaderData } from "./to.$id";
import clsx from "clsx";

export default function TournamentTeamsPage() {
  const data = useOutletContext<TournamentLoaderData>();

  return (
    <div className="stack lg">
      {data.teams.map((team, i) => {
        return <TeamWithRoster key={team.id} team={team} seed={i + 1} />;
      })}
    </div>
  );
}

function TeamWithRoster({
  team,
  seed,
}: {
  team: Pick<FindTeamsByTournamentIdItem, "members" | "name" | "mapPool">;
  seed: number;
}) {
  return (
    <div>
      <div className="tournament__team-with-roster">
        <div className="tournament__team-with-roster__name">
          <span className="tournament__team-with-roster__seed">#{seed}</span>{" "}
          {team.name}
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
                {member.discordName}
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
