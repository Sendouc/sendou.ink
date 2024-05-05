import { HttpServer } from "@effect/platform";
import { Array, Number, Option, Order, Struct, pipe } from "effect";
import { Remix } from "~/shared/services/prelude.server";
import { TeamLoaderSchema } from "../routes/t";
import { Teams } from "../services/Team.server";
import type { Team } from "../t-models";

export const loader = Remix.loaderGen(function* () {
  return yield* HttpServer.response.schemaJson(TeamLoaderSchema)({
    teams: pipe(
      yield* Teams.all,
      Array.sort(
        // xxx: byOwnTeam
        Order.combine(/* byOwnTeam, */ byTeamIsFull, byTeamWidePlusTier),
      ),
    ),
  });
});

const byTeamIsFull = pipe(
  Order.mapInput(Order.boolean, (team: Team) => team.members.length >= 4),
  Order.reverse,
);

const byTeamWidePlusTier = pipe(
  Order.mapInput(Order.number, (team: Team) =>
    pipe(
      team.members,
      Array.map(Struct.get("plusTier")),
      Array.map(Option.getOrElse(() => 100)),
      Array.sort(Order.number),
      Array.take(4),
      Number.sumAll,
    ),
  ),
);
