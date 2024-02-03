import { useTournament } from "~/features/tournament/routes/to.$id";
import type { Bracket as BracketType } from "../../core/Bracket";
import clsx from "clsx";
import { Match } from "./Match";
import { useIsMounted } from "~/hooks/useIsMounted";

interface EliminationBracketSideProps {
  bracket: BracketType;
  type: "winners" | "losers" | "single";
}

export function EliminationBracketSide(props: EliminationBracketSideProps) {
  const tournament = useTournament();
  const rounds = getRounds(props);

  return (
    <div
      className="elim-bracket__container"
      style={{ "--round-count": rounds.length } as any}
    >
      {rounds.map((round) => {
        const bestOf =
          tournament.ctx.bestOfs.find(({ roundId }) => roundId === round.id)
            ?.bestOf ?? 3;

        return (
          <div key={round.id}>
            <RoundHeader
              name={round.name}
              bestOf={bestOf}
              // xxx: calc, first round 5min extra?, no DL in finals
              deadline={new Date()}
            />
            <div className="elim-bracket__round-matches-container">
              {props.bracket.data.match
                .filter((match) => match.round_id === round.id)
                .map((match) => (
                  <Match
                    key={match.id}
                    match={match}
                    roundNumber={round.number}
                    isPreview={props.bracket.preview}
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

  const rounds = props.bracket.data.round
    .flatMap((round) => {
      if (round.group_id && !groupIds.includes(round.group_id)) return [];

      return round;
    })
    .filter((round) => {
      const matches = props.bracket.data.match.filter(
        (match) => match.round_id === round.id,
      );

      // hide rounds with only byes
      return matches.some((m) => m.opponent1 && m.opponent2);
    });

  return rounds.map((round, i) => {
    const name = () => {
      if (props.type === "winners" && i === rounds.length - 2) {
        return "Grand Finals";
      }
      if (props.type === "winners" && i === rounds.length - 1) {
        return "Bracket Reset";
      }

      const namePrefix =
        props.type === "winners" ? "WB " : props.type === "losers" ? "LB " : "";

      const isFinals = i === rounds.length - (props.type === "winners" ? 3 : 1);
      const isSemis = i === rounds.length - (props.type === "winners" ? 4 : 2);

      return `${namePrefix}${isFinals ? "Finals" : isSemis ? "Semis" : `Round ${i + 1}`}`;
    };

    return {
      ...round,
      name: name(),
    };
  });
}

function RoundHeader({
  name,
  bestOf,
  deadline,
}: {
  name: string;
  bestOf: number;
  deadline?: Date;
}) {
  const isMounted = useIsMounted();

  return (
    <div>
      <div className="elim-bracket__round-header">{name}</div>
      <div className="elim-bracket__round-header__infos">
        <div>Bo{bestOf}</div>
        {deadline ? (
          <div
            className={clsx({
              "text-warning": isMounted && deadline < new Date(),
            })}
          >
            DL{" "}
            {deadline.toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "numeric",
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}
