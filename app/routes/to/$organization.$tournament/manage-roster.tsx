import * as React from "react";
import { LinksFunction, useMatches } from "remix";
import { Alert } from "~/components/Alert";
import { TeamRoster } from "~/components/tournament/TeamRoster";
import { FindTournamentByNameForUrlI } from "~/services/tournament";
import styles from "~/styles/tournament-manage-roster.css";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export default function ManageRosterPage() {
  const [, parentRoute] = useMatches();
  const tournamentData = parentRoute.data as FindTournamentByNameForUrlI;
  const [urlWithInviteCode, setUrlWithInviteCode] = React.useState("");

  const ownTeam = tournamentData.teams.find(({ inviteCode }) =>
    Boolean(inviteCode)
  );

  React.useEffect(() => {
    if (ownTeam) {
      setUrlWithInviteCode(
        `${window.location.href.replace("/register", "")}?join=${
          ownTeam.inviteCode
        }`
      );
    }
  }, []);

  // TODO: if not a captain of a team -> redirect
  if (!ownTeam) return null;

  return (
    <div className="tournament__manage-roster">
      {ownTeam.members.length < 4 && (
        <Alert type="warning">
          You need at least 4 players in your roster to play (max 6)
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
            onClick={() => navigator.clipboard.writeText(urlWithInviteCode)}
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
            onClick={() => navigator.clipboard.writeText(urlWithInviteCode)}
          >
            Copy to clipboard
          </button>
        </div>
      </div>
    </div>
  );
}
