import { ActionFunction, json, useLoaderData, useMatches } from "remix";
import type { LinksFunction, LoaderFunction } from "remix";
import { EliminationBracket } from "~/components/tournament/EliminationBracket";
import styles from "~/styles/tournament-bracket.css";
import invariant from "tiny-invariant";
import {
  bracketById,
  FindTournamentByNameForUrlI,
  reportScore,
} from "~/services/tournament";
import type { BracketModified } from "~/services/tournament";
import { useUser } from "~/utils/hooks";
import { BracketActions } from "~/components/tournament/BracketActions";
import { z } from "zod";
import { parseRequestFormData, requireUser } from "~/utils";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

const bracketActionSchema = z.union([
  z.object({
    _action: z.literal("REPORT_SCORE"),
    matchId: z.string().uuid(),
    winnerTeamId: z.string().uuid(),
    playerIds: z.preprocess(
      (val) => (val ? JSON.parse(val as any) : undefined),
      z.array(z.string().uuid()).length(8)
    ),
  }),
  z.object({
    _action: z.literal("UNDO_REPORT_SCORE"),
  }),
]);

type ActionData = {
  ok?: z.infer<typeof bracketActionSchema>["_action"];
};

export const action: ActionFunction = async ({
  request,
  context,
}): Promise<ActionData> => {
  const data = await parseRequestFormData({
    request,
    schema: bracketActionSchema,
  });

  const user = requireUser(context);

  switch (data._action) {
    case "REPORT_SCORE": {
      await reportScore({
        matchId: data.matchId,
        playerIds: data.playerIds,
        userId: user.id,
        winnerTeamId: data.winnerTeamId,
      });
      return { ok: "REPORT_SCORE" };
    }
    case "UNDO_REPORT_SCORE": {
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
  const data = useLoaderData<BracketModified>();
  const [, parentRoute] = useMatches();
  const { teams } = parentRoute.data as FindTournamentByNameForUrlI;
  const user = useUser();

  const ownTeam = teams.find((team) =>
    team.members.some(({ member }) => member.id === user?.id)
  );

  return (
    <div className="tournament-bracket__container">
      <BracketActions />
      <EliminationBracket
        bracketSide={data.winners}
        ownTeamName={ownTeam?.name}
      />
      <EliminationBracket
        bracketSide={data.losers}
        ownTeamName={ownTeam?.name}
      />
    </div>
  );
}
