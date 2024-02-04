import { useBracketExpanded } from "~/features/tournament/routes/to.$id";
import type { Bracket as BracketType } from "../../core/Bracket";
import { EliminationBracketSide } from "./Elimination";

export function Bracket({ bracket }: { bracket: BracketType }) {
  const { bracketExpanded } = useBracketExpanded();

  return (
    <div className="bracket elim-bracket">
      <EliminationBracketSide
        type="winners"
        bracket={bracket}
        isExpanded={bracketExpanded}
      />
      <EliminationBracketSide
        type="losers"
        bracket={bracket}
        isExpanded={bracketExpanded}
      />
    </div>
  );
}
