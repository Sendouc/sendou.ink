import type { Bracket as BracketType } from "../../core/Bracket";
import { EliminationBracketSide } from "./Elimination";

// xxx: hide rounds with only byes like PICNIC 5
export function Bracket({ bracket }: { bracket: BracketType }) {
  return (
    <div className="bracket">
      <EliminationBracketSide type="winners" bracket={bracket} />
      <EliminationBracketSide type="losers" bracket={bracket} />
    </div>
  );
}
