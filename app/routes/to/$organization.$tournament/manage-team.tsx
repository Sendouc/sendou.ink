import {
  ActionFunction,
  json,
  LinksFunction,
  LoaderFunction,
  redirect,
} from "@remix-run/node";
import {
  useActionData,
  useLoaderData,
  useLocation,
  useMatches,
} from "@remix-run/react";
import invariant from "tiny-invariant";
import { CamelCasedProperties } from "type-fest";
import { z } from "zod";
import { AddPlayers } from "~/components/AddPlayers";
import { Alert } from "~/components/Alert";
import { Catcher } from "~/components/Catcher";
import { TeamRoster } from "~/components/tournament/TeamRoster";
import { TOURNAMENT_TEAM_ROSTER_MAX_SIZE } from "~/constants";
import {
  isCaptainOfTheTeam,
  teamHasNotCheckedIn,
} from "~/core/tournament/validators";
import { db } from "~/db";
import { User } from "~/db/types";
import { useUserNew } from "~/hooks/common";
import styles from "~/styles/tournament-manage-team.css";
import {
  notFoundIfFalsy,
  parseRequestFormData,
  requireUserNew,
  validate,
} from "~/utils";
import { tournamentFrontPage } from "~/utils/urls";
import {
  TournamentLoaderData,
  tournamentParamsSchema,
} from "../$organization.$tournament";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

const actionSchema = z.union([
  z.object({
    _action: z.literal("ADD_PLAYER"),
    userId: z.preprocess(Number, z.number().int()),
  }),
  z.object({
    _action: z.literal("DELETE_PLAYER"),
    userId: z.preprocess(Number, z.number().int()),
  }),
  z.object({
    _action: z.literal("UNREGISTER"),
  }),
]);

type ActionData = {
  error?: { userId?: string };
  ok?: z.infer<typeof actionSchema>["_action"];
};

export const action: ActionFunction = async ({
  params,
  request,
  context,
}): Promise<ActionData> => {
  const data = await parseRequestFormData({
    request,
    schema: actionSchema,
  });
  const user = requireUserNew(context);

  const namesForUrl = tournamentParamsSchema.parse(params);
  const tournament = notFoundIfFalsy(
    db.tournament.findByNamesForUrl(namesForUrl)
  );

  const ownTeam = db.tournamentTeam.findByUserId({
    user_id: user.id,
    tournament_id: tournament.id,
  });
  validate(ownTeam, "Not registered");
  validate(
    isCaptainOfTheTeam({ user, teamMembers: ownTeam.members }),
    "Not captain of the team"
  );

  switch (data._action) {
    case "ADD_PLAYER": {
      validate(
        !db.tournamentTeam.findByUserId({
          user_id: data.userId,
          tournament_id: tournament.id,
        }),
        "Already in team"
      );
      db.tournamentTeam.joinTeam({ user_id: data.userId, team_id: ownTeam.id });

      return { ok: "ADD_PLAYER" };
    }
    case "DELETE_PLAYER": {
      validate(data.userId !== user.id, "Can't remove self");
      validate(
        teamHasNotCheckedIn(ownTeam),
        "Can't remove players after checking in"
      );

      db.tournamentTeam.leaveTeam({
        team_id: ownTeam.id,
        user_id: data.userId,
      });

      return { ok: "DELETE_PLAYER" };
    }
    case "UNREGISTER": {
      validate(
        !db.tournamentBracket.activeIdByTournamentId(tournament.id),
        "Tournament is ongoing"
      );

      db.tournamentTeam.del(ownTeam.id);

      return { ok: "UNREGISTER" };
    }
    default: {
      const exhaustive: never = data;
      throw new Response(`Unknown action: ${JSON.stringify(exhaustive)}`, {
        status: 400,
      });
    }
  }
};

export type ManageTeamLoaderData = {
  inviteCode: string;
  trustingUsers: CamelCasedProperties<Pick<User, "id" | "discord_name">>[];
};

export const loader: LoaderFunction = ({ params, context }) => {
  const namesForUrl = tournamentParamsSchema.parse(params);
  const tournament = notFoundIfFalsy(
    db.tournament.findByNamesForUrl(namesForUrl)
  );

  const user = requireUserNew(context);

  const ownTeam = db.tournamentTeam.findByUserId({
    user_id: user.id,
    tournament_id: tournament.id,
  });

  if (!ownTeam || !isCaptainOfTheTeam({ user, teamMembers: ownTeam.members })) {
    return redirect(tournamentFrontPage(namesForUrl));
  }

  return json<ManageTeamLoaderData>({
    inviteCode: ownTeam.invite_code,
    trustingUsers: db.user
      .trustedPlayersAvailableForTournamentTeam({
        trust_receiver_id: user.id,
        tournament_id: tournament.id,
      })
      .map((u) => ({ id: u.id, discordName: u.discord_name })),
  });
};

// TODO: should not 404 but redirect instead - catchBoundary?
export default function ManageTeamPage() {
  const actionData = useActionData<ActionData>();
  const location = useLocation();
  const data = useLoaderData<ManageTeamLoaderData>();
  const [, parentRoute] = useMatches();
  const { teams } = parentRoute.data as TournamentLoaderData;
  const user = useUserNew();

  const ownTeam = teams.find((t) =>
    t.members.some((m) => m.id === user?.id && m.isCaptain)
  );
  invariant(ownTeam, "!ownTeam");

  return (
    <div className="tournament__manage-team">
      {ownTeam.members.length >= TOURNAMENT_TEAM_ROSTER_MAX_SIZE && (
        <Alert type="info">
          Your team is full - more players can&apos;t be added
        </Alert>
      )}
      <div className="tournament__manage-team__roster-container">
        <TeamRoster
          team={ownTeam}
          deleteMode={!ownTeam.checkedInTimestamp}
          showUnregister
        />
      </div>
      {ownTeam.members.length < TOURNAMENT_TEAM_ROSTER_MAX_SIZE && (
        <AddPlayers
          pathname={location.pathname
            .replace("manage-team", "join-team")
            .slice(1)}
          inviteCode={data.inviteCode}
          trustingUsers={data.trustingUsers}
          hiddenInputs={[{ name: "_action", value: "ADD_PLAYER" }]}
          addUserError={actionData?.error?.userId}
          legendText="Add players to team"
        />
      )}
    </div>
  );
}

// TODO: handle 404 (logged in but not registered)
export const CatchBoundary = Catcher;
