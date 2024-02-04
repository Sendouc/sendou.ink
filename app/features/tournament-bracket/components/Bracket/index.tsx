import { useBracketExpanded } from "~/features/tournament/routes/to.$id";
import type { Bracket as BracketType } from "../../core/Bracket";
import { EliminationBracketSide } from "./Elimination";
import { RoundRobinBracket } from "./RoundRobin";

export function Bracket({ bracket }: { bracket: BracketType }) {
  const { bracketExpanded } = useBracketExpanded();

  if (bracket.type === "round_robin") {
    return (
      <div className="bracket elim-bracket">
        <RoundRobinBracket bracket={bracket} />
      </div>
    );
  }

  if (bracket.type === "single_elimination") {
    return (
      <div className="bracket elim-bracket">
        <EliminationBracketSide
          type="single"
          bracket={bracket}
          isExpanded={bracketExpanded}
        />
      </div>
    );
  }

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
