import { json, useLoaderData, useMatches } from "remix";
import type { LinksFunction, LoaderFunction } from "remix";
import { EliminationBracket } from "~/components/tournament/EliminationBracket";
import styles from "~/styles/tournament-bracket.css";
import invariant from "tiny-invariant";
import {
  bracketById,
  FindTournamentByNameForUrlI,
} from "~/services/tournament";
import type { BracketModified } from "~/services/tournament";
import { useUser } from "~/utils/hooks";
import { BracketActions } from "~/components/tournament/BracketActions";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
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
    /* TODO: should be able to go wider than container https://stackoverflow.com/questions/5581034/is-there-are-way-to-make-a-child-divs-width-wider-than-the-parent-div-using-css */
    <div className="flex w-full flex-col gap-6">
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
