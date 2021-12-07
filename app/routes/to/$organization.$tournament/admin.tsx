import { useFetcher, useMatches } from "remix";
import type { LinksFunction } from "remix";
import { Button } from "~/components/Button";
import type { FindTournamentByNameForUrlI } from "~/services/tournament";
import styles from "~/styles/tournament-admin.css";
import * as React from "react";
import classNames from "classnames";
import { TOURNAMENT_TEAM_ROSTER_MIN_SIZE } from "~/constants";
import { Alert } from "~/components/Alert";
import { MyForm } from "~/components/MyForm";
import { checkInHasStarted } from "~/core/tournament/utils";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export default function AdminPage() {
  const [, parentRoute] = useMatches();
  const { teams, checkInStartTime } =
    parentRoute.data as FindTournamentByNameForUrlI;

  return (
    <>
      <div className="tournament__admin__buttons-container">
        <Button>Start tournament</Button>
        <Button variant="outlined">Edit tournament</Button>
      </div>
      <Alert type="info" className="tournament__admin__alert">
        Drag teams to adjust their seeding
      </Alert>
      <div className="tournament__admin__teams-container">
        <div className="tournament__admin__teams-container__header">Seed</div>
        <div className="tournament__admin__teams-container__header">Name</div>
        <div className="tournament__admin__teams-container__header">
          {checkInHasStarted(checkInStartTime) ? "" : "Registered at"}
        </div>
        <div className="tournament__admin__teams-container__header">
          Roster size
        </div>
        {/* TODO: order by seed */}
        {teams.map((team, i) => (
          <React.Fragment key={team.id}>
            <div>{i + 1}</div>
            <div>{team.name}</div>
            <div>
              {!checkInHasStarted(checkInStartTime) ? (
                <>
                  {new Date(team.createdAt).toLocaleString("en-US", {
                    month: "numeric",
                    day: "numeric",
                    hour: "numeric",
                    minute: "numeric",
                  })}
                </>
              ) : team.checkedInTime ? (
                <CheckOutButton teamId={team.id} />
              ) : team.members.length >= TOURNAMENT_TEAM_ROSTER_MIN_SIZE ? (
                <CheckInButton teamId={team.id} />
              ) : null}
            </div>
            <div
              className={classNames({
                tournament__admin__ok:
                  team.members.length >= TOURNAMENT_TEAM_ROSTER_MIN_SIZE,
                tournament__admin__problem:
                  team.members.length < TOURNAMENT_TEAM_ROSTER_MIN_SIZE,
              })}
            >
              {team.members.length}
            </div>
          </React.Fragment>
        ))}
      </div>
    </>
  );
}

function CheckOutButton({ teamId }: { teamId: string }) {
  const fetcher = useFetcher();
  return (
    <MyForm
      action={`/api/tournament/${teamId}/check-out`}
      className="tournament__action-section__button-container"
      fetcher={fetcher}
    >
      <Button
        tiny
        variant="minimal-destructive"
        loading={fetcher.state !== "idle"}
        loadingText="Checking out"
        type="submit"
      >
        Check-out
      </Button>
    </MyForm>
  );
}

function CheckInButton({ teamId }: { teamId: string }) {
  const fetcher = useFetcher();
  return (
    <MyForm
      action={`/api/tournament/${teamId}/check-in`}
      className="tournament__action-section__button-container"
      fetcher={fetcher}
    >
      <Button
        tiny
        variant="minimal"
        loading={fetcher.state !== "idle"}
        loadingText="Checking in"
        type="submit"
      >
        Check-in
      </Button>
    </MyForm>
  );
}
