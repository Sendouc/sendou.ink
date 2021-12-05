import * as React from "react";
import { LinksFunction, useLoaderData, json, useLocation } from "remix";
import type { LoaderFunction } from "remix";
import { Alert } from "~/components/Alert";
import { TeamRoster } from "~/components/tournament/TeamRoster";
import {
  TOURNAMENT_TEAM_ROSTER_MAX_SIZE,
  TOURNAMENT_TEAM_ROSTER_MIN_SIZE,
} from "~/constants";
import {
  ownTeamWithInviteCode,
  OwnTeamWithInviteCodeI,
} from "~/services/tournament";
import styles from "~/styles/tournament-manage-roster.css";
import { requireUser, useBaseURL } from "~/utils";
import { getTrustingUsers, GetTrustingUsersI } from "~/services/user";
import invariant from "tiny-invariant";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

type Data = {
  ownTeam: OwnTeamWithInviteCodeI;
  trustingUsers: GetTrustingUsersI;
};

const typedJson = (args: Data) => json(args);

export const loader: LoaderFunction = async ({ params, context }) => {
  invariant(
    typeof params.organization === "string",
    "Expected params.organization to be string"
  );
  invariant(
    typeof params.tournament === "string",
    "Expected params.tournament to be string"
  );

  const user = requireUser(context);
  let [ownTeam, trustingUsers] = await Promise.all([
    ownTeamWithInviteCode({
      organizationNameForUrl: params.organization,
      tournamentNameForUrl: params.tournament,
      userId: user.id,
    }),
    getTrustingUsers(user.id),
  ]);

  trustingUsers = trustingUsers.filter(({ trustGiver }) => {
    return !ownTeam.members.some(({ member }) => member.id === trustGiver.id);
  });

  return typedJson({ ownTeam, trustingUsers });
};

export default function ManageRosterPage() {
  const [showCopied, setShowCopied] = React.useState(false);
  const { ownTeam, trustingUsers } = useLoaderData<Data>();
  const baseURL = useBaseURL();
  const location = useLocation();

  React.useEffect(() => {
    if (!showCopied) return;
    const timeout = setTimeout(() => setShowCopied(false), 3000);

    return () => clearTimeout(timeout);
  }, [showCopied]);

  const urlWithInviteCode = `${baseURL}${location.pathname.replace(
    "manage-roster",
    "join-team"
  )}?code=${ownTeam.inviteCode}`;

  return (
    <div className="tournament__manage-roster">
      {ownTeam.members.length < 4 && (
        <Alert type="warning" data-cy="team-size-alert">
          You need at least {TOURNAMENT_TEAM_ROSTER_MIN_SIZE} players in your
          roster to play (max {TOURNAMENT_TEAM_ROSTER_MAX_SIZE})
        </Alert>
      )}
      <div className="tournament__manage-roster__roster-container">
        <TeamRoster team={ownTeam} />
      </div>
      <div className="tournament__manage-roster__actions">
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
        {trustingUsers.length > 0 && (
          <div className="tournament__manage-roster__actions__section">
            <label>Add players you previously played with</label>
            <select className="tournament__manage-roster__select">
              {trustingUsers.map(({ trustGiver }) => (
                <option key={trustGiver.id}>{trustGiver.discordName}</option>
              ))}
            </select>
            <button
              className="tournament__manage-roster__input__button"
              onClick={() => console.log("todo: handle add")}
            >
              Add to roster
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
