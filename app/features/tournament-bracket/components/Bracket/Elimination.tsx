import type { Bracket as BracketType } from "../../core/Bracket";
import { Match } from "./Match";
import { RoundHeader } from "./RoundHeader";
import clsx from "clsx";
import { removeDuplicates } from "~/utils/arrays";

interface EliminationBracketSideProps {
  bracket: BracketType;
  type: "winners" | "losers" | "single";
  isExpanded: boolean;
}

export function EliminationBracketSide(props: EliminationBracketSideProps) {
  const rounds = getRounds(props);

  let atLeastOneColumnHidden = false;
  return (
    <div
      className="elim-bracket__container"
      style={{ "--round-count": rounds.length }}
    >
      {rounds.flatMap((round, roundIdx) => {
        const bestOf = round.maps?.count;

        const matches = props.bracket.data.match.filter(
          (match) => match.round_id === round.id,
        );

        const someMatchOngoing = matches.some(
          (match) =>
            match.opponent1 &&
            match.opponent2 &&
            match.opponent1.result !== "win" &&
            match.opponent2.result !== "win",
        );

        if (
          !props.isExpanded &&
          // always show at least 2 rounds per side
          roundIdx < rounds.length - 2 &&
          !someMatchOngoing
        ) {
          atLeastOneColumnHidden = true;
          return null;
        }

        return (
          <div
            key={round.id}
            className="elim-bracket__round-column"
            data-round-id={round.id}
          >
            <RoundHeader
              roundId={round.id}
              name={round.name}
              bestOf={bestOf}
              showInfos={someMatchOngoing}
            />
            <div
              className={clsx("elim-bracket__round-matches-container", {
                "elim-bracket__round-matches-container__top-bye":
                  !atLeastOneColumnHidden &&
                  props.type === "winners" &&
                  (!props.bracket.data.match[0].opponent1 ||
                    !props.bracket.data.match[0].opponent2),
              })}
            >
              {matches.map((match) => (
                <Match
                  key={match.id}
                  match={match}
                  roundNumber={round.number}
                  isPreview={props.bracket.preview}
                  showSimulation={round.name !== "Bracket Reset"}
                  bracket={props.bracket}
                  type={
                    round.name === "Grand Finals" ||
                    round.name === "Bracket Reset"
                      ? "grands"
                      : props.type === "winners"
                        ? "winners"
                        : props.type === "losers"
                          ? "losers"
                          : undefined
                  }
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function getRounds(props: EliminationBracketSideProps) {
  const groupIds = props.bracket.data.group.flatMap((group) => {
    if (props.type === "winners" && group.number === 2) return [];
    if (props.type === "losers" && group.number !== 2) return [];

    return group.id;
  });

  let showingBracketReset = props.bracket.data.round.length > 1;
  const rounds = props.bracket.data.round
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
      const isBracketReset =
        props.type === "winners" && i === rounds.length - 1;
      const grandFinalsMatch =
        props.type === "winners"
          ? props.bracket.data.match.find(
              (match) => match.round_id === rounds[rounds.length - 2]?.id,
            )
          : undefined;

      if (isBracketReset && grandFinalsMatch?.opponent1?.result === "win") {
        showingBracketReset = false;
        return false;
      }

      const matches = props.bracket.data.match.filter(
        (match) => match.round_id === round.id,
      );

      const atLeastOneNonByeMatch = matches.some(
        (m) => m.opponent1 && m.opponent2,
      );

      return atLeastOneNonByeMatch;
    });

  const hasThirdPlaceMatch =
    props.type === "single" &&
    removeDuplicates(props.bracket.data.match.map((m) => m.group_id)).length >
      1;
  return rounds.map((round, i) => {
    const name = () => {
      if (
        showingBracketReset &&
        props.type === "winners" &&
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

      if (props.type === "winners" && i === rounds.length - 1) {
        return showingBracketReset ? "Bracket Reset" : "Grand Finals";
      }

      const namePrefix =
        props.type === "winners" ? "WB " : props.type === "losers" ? "LB " : "";

      const isFinals = i === rounds.length - (props.type === "winners" ? 3 : 1);

      const semisOffSet =
        props.type === "winners" ? 4 : hasThirdPlaceMatch ? 3 : 2;
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
