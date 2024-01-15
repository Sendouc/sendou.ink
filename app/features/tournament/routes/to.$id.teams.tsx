import { useOutletContext } from "@remix-run/react";
import { tournamentTeamPage } from "~/utils/urls";
import { TeamWithRoster } from "../components/TeamWithRoster";
import type { TournamentLoaderData } from "./to.$id";

export default function TournamentTeamsPage() {
  const data = useOutletContext<TournamentLoaderData>();

  return (
    <div className="stack lg">
      {data.teams.map((team, i) => {
        return (
          <TeamWithRoster
            key={team.id}
            team={team}
            seed={i + 1}
            teamPageUrl={tournamentTeamPage({
              eventId: data.tournament.id,
              tournamentTeamId: team.id,
            })}
          />
        );
      })}
    </div>
  );
}
