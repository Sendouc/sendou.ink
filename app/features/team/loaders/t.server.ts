import { HttpServer } from "@effect/platform";
import { Array, Number, Option, Struct, pipe } from "effect";
import { Order, Remix } from "~/shared/prelude.server";
import { TeamLoaderSchema } from "../routes/t";
import { Teams } from "../services/Teams.server";
import type { Team } from "../t-models";
import { Auth } from "~/shared/services/Auth.server";
import type { AuthUser } from "~/features/user-page/user-page-models";

export const loader = Remix.loaderGen(function* () {
  const auth = yield* Auth;
  const loggedInUser = yield* auth.loggedInUserOption;

  return yield* HttpServer.response.schemaJson(TeamLoaderSchema)({
    teams: pipe(
      yield* Teams.all,
      Array.sort(
        Order.combineAll([
          byOwnTeamFirst(loggedInUser),
          byTeamIsFull,
          byTeamWidePlusTier,
        ]),
      ),
    ),
  });
});

const byOwnTeamFirst = (user: Option.Option<AuthUser>) =>
  Order.mapInput(Order.booleanReversed, (team: Team) =>
    pipe(
      user,
      Option.match({
        onSome: (u) => team.members.some((m) => m.id === u.id),
        onNone: () => false,
      }),
    ),
  );

const byTeamIsFull = Order.mapInput(
  Order.booleanReversed,
  (team: Team) => team.members.length >= 4,
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
