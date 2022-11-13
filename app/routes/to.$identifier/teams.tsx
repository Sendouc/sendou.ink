import { useOutletContext } from "@remix-run/react";
import { AlertIcon } from "~/components/icons/Alert";
import { CheckmarkIcon } from "~/components/icons/Checkmark";
import { Image } from "~/components/Image";
import { Main } from "~/components/Main";
import { navIconUrl } from "~/utils/urls";
import type { TournamentToolsLoaderData } from "../to.$identifier";
import { TeamWithRoster } from "./components/TeamWithRoster";

export default function TournamentToolsTeamsPage() {
  const data = useOutletContext<TournamentToolsLoaderData>();

  return (
    <Main className="stack lg">
      {data.teams.map((team) => {
        return (
          <div key={team.id} className="stack sm items-center">
            <div className="tournament__pick-status-container">
              <Image
                path={navIconUrl("maps")}
                alt="Maps picked status"
                title="Maps picked status"
                height={16}
                width={16}
              />
              {team.mapPool && team.mapPool.length > 0 ? (
                <CheckmarkIcon className="fill-success" />
              ) : (
                <AlertIcon className="fill-warning" />
              )}
            </div>
            <TeamWithRoster team={team} />
          </div>
        );
      })}
    </Main>
  );
}
