import {
  ActionFunction,
  json,
  LinksFunction,
  LoaderFunction,
  Outlet,
  ShouldReloadFunction,
  useMatches,
} from "remix";
import invariant from "tiny-invariant";
import { z } from "zod";
import { BracketActions } from "~/components/tournament/BracketActions";
import { EliminationBracket } from "~/components/tournament/EliminationBracket";
import { BEST_OF_OPTIONS, TOURNAMENT_TEAM_ROSTER_MIN_SIZE } from "~/constants";
import { bracketToChangedMMRs } from "~/core/mmr/utils";
import { isTournamentAdmin } from "~/core/tournament/validators";
import { useUser } from "~/hooks/common";
import { useBracketDataWithEvents } from "~/hooks/useBracketDataWithEvents";
import * as Skill from "~/models/Skill.server";
import * as Tournament from "~/models/Tournament.server";
import * as TournamentMatch from "~/models/TournamentMatch.server";
import type { BracketModified } from "~/services/bracket";
import { bracketById, reportScore, undoLastScore } from "~/services/bracket";
import {
  findTournamentByNameForUrl,
  FindTournamentByNameForUrlI,
} from "~/services/tournament";
import styles from "~/styles/tournament-bracket.css";
import {
  getSocket,
  parseRequestFormData,
  requireUser,
  safeJSONParse,
  validate,
} from "~/utils";
import { db } from "~/utils/db.server";
import { chatRoute } from "~/utils/urls";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

const bracketActionSchema = z.union([
  z.object({
    _action: z.literal("REPORT_SCORE"),
    matchId: z.string().uuid(),
    winnerTeamId: z.string().uuid(),
    position: z.preprocess(
      Number,
      z
        .number()
        .min(1)
        .max(Math.max(...BEST_OF_OPTIONS))
    ),
    playerIds: z.preprocess(
      safeJSONParse,
      z.array(z.string().uuid()).length(TOURNAMENT_TEAM_ROSTER_MIN_SIZE * 2)
    ),
  }),
  z.object({
    _action: z.literal("UNDO_REPORT_SCORE"),
    matchId: z.string().uuid(),
    position: z.preprocess(
      Number,
      z
        .number()
        .min(1)
        .max(Math.max(...BEST_OF_OPTIONS))
    ),
  }),
  z.object({
    _action: z.literal("FINISH_TOURNAMENT"),
  }),
]);

type ActionData = {
  ok?: z.infer<typeof bracketActionSchema>["_action"];
};

export const action: ActionFunction = async ({
  params,
  request,
  context,
}): Promise<ActionData> => {
  const data = await parseRequestFormData({
    request,
    schema: bracketActionSchema,
  });
  invariant(typeof params.bid === "string", "Expected params.bid to be string");
  const user = requireUser(context);
  const socket = getSocket(context);

  switch (data._action) {
    case "REPORT_SCORE": {
      const bracketData = await reportScore({
        matchId: data.matchId,
        playerIds: data.playerIds,
        userId: user.id,
        winnerTeamId: data.winnerTeamId,
        position: data.position,
        bracketId: params.bid,
      });

      socket.emit(`bracket-${params.bid}`, bracketData);

      return { ok: "REPORT_SCORE" };
    }
    case "UNDO_REPORT_SCORE": {
      const bracketData = await undoLastScore({
        matchId: data.matchId,
        position: data.position,
        userId: user.id,
      });

      socket.emit(`bracket-${params.bid}`, bracketData);

      return { ok: "UNDO_REPORT_SCORE" };
    }
    case "FINISH_TOURNAMENT": {
      invariant(params.organization, "!params.organization");
      invariant(params.tournament, "!params.tournament");

      const [tournament, matches] = await Promise.all([
        findTournamentByNameForUrl({
          organizationNameForUrl: params.organization,
          tournamentNameForUrl: params.tournament,
        }),
        TournamentMatch.allTournamentMatchesWithRosterInfo(params.bid),
      ]);
      const skills = await Skill.findAllMostRecent(
        tournament.teams.flatMap((t) => t.members.map((m) => m.member.id))
      );

      validate(
        isTournamentAdmin({
          userId: user.id,
          organization: tournament.organizer,
        }),
        "Not tournament admin"
      );

      await db.$transaction([
        Skill.createMany(
          bracketToChangedMMRs({ matches, skills }).map((s) => ({
            ...s,
            tournamentId: tournament.id,
          }))
        ),
        Tournament.conclude(tournament.id),
      ]);

      return { ok: "FINISH_TOURNAMENT" };
    }
    default: {
      const exhaustive: never = data;
      throw new Response(`Unknown action: ${JSON.stringify(exhaustive)}`, {
        status: 400,
      });
    }
  }
};

export const unstable_shouldReload: ShouldReloadFunction = (data) => {
  return data.submission?.action !== chatRoute();
};

export const loader: LoaderFunction = async ({ params }) => {
  invariant(typeof params.bid === "string", "Expected params.bid to be string");

  const bracket = await bracketById(params.bid);
  return json<BracketModified>(bracket);
};

// TODO: make bracket a bit smaller
export default function BracketTabWrapper() {
  const data = useBracketDataWithEvents();
  const [, parentRoute] = useMatches();
  const { teams } = parentRoute.data as FindTournamentByNameForUrlI;
  const user = useUser();

  const ownTeam = teams.find((team) =>
    team.members.some(({ member }) => member.id === user?.id)
  );

  const winnersRounds = data.rounds.filter((round) => round.side === "winners");
  const losersRounds = data.rounds.filter((round) => round.side === "losers");

  return (
    <div className="tournament-bracket__container">
      <Outlet />
      <BracketActions data={data} />
      <EliminationBracket rounds={winnersRounds} ownTeamName={ownTeam?.name} />
      {losersRounds.length > 0 ? (
        <EliminationBracket rounds={losersRounds} ownTeamName={ownTeam?.name} />
      ) : null}
    </div>
  );
}
