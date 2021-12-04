import * as React from "react";
import { LinksFunction, useMatches } from "remix";
import { Alert } from "~/components/Alert";
import { TeamRoster } from "~/components/tournament/TeamRoster";
import {
  TOURNAMENT_TEAM_ROSTER_MAX_SIZE,
  TOURNAMENT_TEAM_ROSTER_MIN_SIZE,
} from "~/constants";
import { FindTournamentByNameForUrlI } from "~/services/tournament";
import styles from "~/styles/tournament-manage-roster.css";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export default function ManageRosterPage() {
  const [, parentRoute] = useMatches();
  const tournamentData = parentRoute.data as FindTournamentByNameForUrlI;
  const [urlWithInviteCode, setUrlWithInviteCode] = React.useState("");
  const [showCopied, setShowCopied] = React.useState(false);

  const ownTeam = tournamentData.teams.find(({ inviteCode }) =>
    Boolean(inviteCode)
  );

  React.useEffect(() => {
    if (ownTeam) {
      setUrlWithInviteCode(
        `${window.location.href.replace("manage-roster", "join-team")}?code=${
          ownTeam.inviteCode
        }`
      );
    }
  }, []);

  React.useEffect(() => {
    if (!showCopied) return;
    const timeout = setTimeout(() => setShowCopied(false), 3000);

    return () => clearTimeout(timeout);
  }, [showCopied]);

  // TODO: if not a captain of a team -> redirect
  if (!ownTeam) return null;

  return (
    <div className="tournament__manage-roster">
      {ownTeam.members.length < 4 && (
        <Alert type="warning">
          You need at least {TOURNAMENT_TEAM_ROSTER_MIN_SIZE} players in your
          roster to play (max {TOURNAMENT_TEAM_ROSTER_MAX_SIZE})
        </Alert>
      )}
      <TeamRoster team={ownTeam} />
      <div className="tournament__manage-roster__actions">
        <div className="tournament__manage-roster__actions__section">
          <label>Add players you previously played with</label>
          <select className="tournament__manage-roster__select">
            <option>Sendou#0043</option>
          </select>
          <button
            className="tournament__manage-roster__input__button"
            onClick={() => console.log("todo: handle add")}
          >
            Add to roster
          </button>
        </div>
        <div className="tournament__manage-roster__actions__section">
          <label htmlFor="inviteCodeInput">
            Share this URL to invite players to your team
          </label>
          <input
            id="inviteCodeInput"
            className="tournament__manage-roster__input"
            disabled
            value={urlWithInviteCode}
          />
          <button
            className="tournament__manage-roster__input__button"
            onClick={() => {
              navigator.clipboard.writeText(urlWithInviteCode);
              setShowCopied(true);
            }}
          >
            {showCopied ? "Copied!" : "Copy to clipboard"}
          </button>
        </div>
      </div>
    </div>
  );
}
