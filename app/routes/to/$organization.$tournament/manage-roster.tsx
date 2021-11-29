import * as React from "react";
import { useMatches, LinksFunction } from "remix";
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
      <TeamRoster team={ownTeam} />
      <div className="tournament__manage-roster__actions-container">
        <div>
          <label>Add players you previously played with</label>
          <select>
            <option>Sendou#0043</option>
          </select>
        </div>
        <div>
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
            className="tournament__manage-roster__input__copy-button"
            onClick={() => navigator.clipboard.writeText(urlWithInviteCode)}
          >
            Copy to clipboard
          </button>
        </div>
      </div>
    </div>
  );
}
