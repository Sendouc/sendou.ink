import type { LinksFunction, LoaderFunction } from "remix";
import { ActionFunction, json, useMatches } from "remix";
import invariant from "tiny-invariant";
import { z } from "zod";
import { BracketActions } from "~/components/tournament/BracketActions";
import { EliminationBracket } from "~/components/tournament/EliminationBracket";
import { BEST_OF_OPTIONS, TOURNAMENT_TEAM_ROSTER_MIN_SIZE } from "~/constants";
import { useBracketDataWithEvents } from "~/hooks/useBracketDataWithEvents";
import type { BracketModified } from "~/services/bracket";
import { bracketById, reportScore, undoLastScore } from "~/services/bracket";
import type { FindTournamentByNameForUrlI } from "~/services/tournament";
import styles from "~/styles/tournament-bracket.css";
import {
  parseRequestFormData,
  requireEvents,
  requireUser,
  safeJSONParse,
} from "~/utils";
import { useUser } from "~/utils/hooks";

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
  invariant(typeof params.id === "string", "Expected params.id to be string");
  const user = requireUser(context);
  const events = requireEvents(context);

  switch (data._action) {
    case "REPORT_SCORE": {
      const bracketData = await reportScore({
        matchId: data.matchId,
        playerIds: data.playerIds,
        userId: user.id,
        winnerTeamId: data.winnerTeamId,
        position: data.position,
        bracketId: params.id,
      });
      if (bracketData) {
        for (const { event } of events.bracket[params.id]) {
          event(bracketData);
        }
      }

      return { ok: "REPORT_SCORE" };
    }
    case "UNDO_REPORT_SCORE": {
      const bracketData = await undoLastScore({
        matchId: data.matchId,
        position: data.position,
        userId: user.id,
      });

      if (bracketData) {
        for (const { event } of events.bracket[params.id]) {
          event(bracketData);
        }
      }

      return { ok: "UNDO_REPORT_SCORE" };
    }
    default: {
      const exhaustive: never = data;
      throw new Response(`Unknown action: ${JSON.stringify(exhaustive)}`, {
        status: 400,
      });
    }
  }
};

const typedJson = (args: BracketModified) => json(args);

export const loader: LoaderFunction = async ({ params }) => {
  invariant(typeof params.id === "string", "Expected params.id to be string");

  const bracket = await bracketById(params.id);
  return typedJson(bracket);
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

  return (
    <div className="tournament-bracket__container">
      <BracketActions data={data} />
      <EliminationBracket
        rounds={data.rounds.filter((round) => round.side === "winners")}
        ownTeamName={ownTeam?.name}
      />
      <EliminationBracket
        rounds={data.rounds.filter((round) => round.side === "losers")}
        ownTeamName={ownTeam?.name}
      />
    </div>
  );
}
