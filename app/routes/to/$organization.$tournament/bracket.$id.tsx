import { json, useLoaderData } from "remix";
import type { LinksFunction, LoaderFunction } from "remix";
import { EliminationBracket } from "~/components/tournament/EliminationBracket";
import styles from "~/styles/tournament-bracket.css";
import invariant from "tiny-invariant";
import { bracketById } from "~/services/tournament";
import type { BracketModified } from "~/services/tournament";

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

  return (
    <div className="tournament-bracket__container">
      <EliminationBracket bracketSide={data.winners} />
      <EliminationBracket bracketSide={data.losers} />
    </div>
  );
}
