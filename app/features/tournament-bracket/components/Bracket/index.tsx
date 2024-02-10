import { useBracketExpanded } from "~/features/tournament/routes/to.$id";
import type { Bracket as BracketType } from "../../core/Bracket";
import { EliminationBracketSide } from "./Elimination";
import { RoundRobinBracket } from "./RoundRobin";

export function Bracket({ bracket }: { bracket: BracketType }) {
  const { bracketExpanded } = useBracketExpanded();

  if (bracket.type === "round_robin") {
    return (
      <BracketContainer>
        <RoundRobinBracket bracket={bracket} />
      </BracketContainer>
    );
  }

  if (bracket.type === "single_elimination") {
    return (
      <BracketContainer>
        <EliminationBracketSide
          type="single"
          bracket={bracket}
          isExpanded={bracketExpanded}
        />
      </BracketContainer>
    );
  }

  return (
    <BracketContainer>
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
    </BracketContainer>
  );
}

function BracketContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="bracket" data-testid="brackets-viewer">
      {children}
    </div>
  );
}
