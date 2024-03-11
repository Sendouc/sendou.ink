import { removeDuplicates } from "~/utils/arrays";
import type { Bracket as BracketType } from "./Bracket";

export function getRounds(args: {
  bracket: BracketType;
  type: "winners" | "losers" | "single";
}) {
  const groupIds = args.bracket.data.group.flatMap((group) => {
    if (args.type === "winners" && group.number === 2) return [];
    if (args.type === "losers" && group.number !== 2) return [];

    return group.id;
  });

  let showingBracketReset = args.bracket.data.round.length > 1;
  const rounds = args.bracket.data.round
    .flatMap((round) => {
      if (
        typeof round.group_id === "number" &&
        !groupIds.includes(round.group_id)
      ) {
        return [];
      }

      return round;
    })
    .filter((round, i, rounds) => {
      const isBracketReset = args.type === "winners" && i === rounds.length - 1;
      const grandFinalsMatch =
        args.type === "winners"
          ? args.bracket.data.match.find(
              (match) => match.round_id === rounds[rounds.length - 2]?.id,
            )
          : undefined;

      if (isBracketReset && grandFinalsMatch?.opponent1?.result === "win") {
        showingBracketReset = false;
        return false;
      }

      const matches = args.bracket.data.match.filter(
        (match) => match.round_id === round.id,
      );

      const atLeastOneNonByeMatch = matches.some(
        (m) => m.opponent1 && m.opponent2,
      );

      return atLeastOneNonByeMatch;
    });

  const hasThirdPlaceMatch =
    args.type === "single" &&
    removeDuplicates(args.bracket.data.match.map((m) => m.group_id)).length > 1;
  return rounds.map((round, i) => {
    const name = () => {
      if (
        showingBracketReset &&
        args.type === "winners" &&
        i === rounds.length - 2
      ) {
        return "Grand Finals";
      }

      if (hasThirdPlaceMatch && i === rounds.length - 2) {
        return "Finals";
      }
      if (hasThirdPlaceMatch && i === rounds.length - 1) {
        return "3rd place match";
      }

      if (args.type === "winners" && i === rounds.length - 1) {
        return showingBracketReset ? "Bracket Reset" : "Grand Finals";
      }

      const namePrefix =
        args.type === "winners" ? "WB " : args.type === "losers" ? "LB " : "";

      const isFinals = i === rounds.length - (args.type === "winners" ? 3 : 1);

      const semisOffSet =
        args.type === "winners" ? 4 : hasThirdPlaceMatch ? 3 : 2;
      const isSemis = i === rounds.length - semisOffSet;

      return `${namePrefix}${
        isFinals ? "Finals" : isSemis ? "Semis" : `Round ${i + 1}`
      }`;
    };

    return {
      ...round,
      name: name(),
    };
  });
}
