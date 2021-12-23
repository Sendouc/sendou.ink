import type { LinksFunction } from "remix";
import { EliminationBracket } from "~/components/tournament/EliminationBracket";
import styles from "~/styles/tournament-bracket.css";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export default function BracketTabWrapper() {
  return (
    <div className="tournament-bracket__container">
      <EliminationBracket />
    </div>
  );
}
