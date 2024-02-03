import type { Bracket as BracketType } from "../../core/Bracket";
import { EliminationBracketSide } from "./Elimination";

export function Bracket({ bracket }: { bracket: BracketType }) {
  return (
    <div className="bracket">
      <EliminationBracketSide type="winners" bracket={bracket} />
      <EliminationBracketSide type="losers" bracket={bracket} />
    </div>
  );
}
