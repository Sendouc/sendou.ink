import { useTournament } from "~/features/tournament/routes/to.$id";
import type { Bracket as BracketType } from "../../core/Bracket";
import { RoundHeader } from "./RoundHeader";
import { Match } from "./Match";
import type { Match as MatchType } from "~/modules/brackets-model";

// xxx: placement tables & show destination brackets
export function RoundRobinBracket({ bracket }: { bracket: BracketType }) {
  const groups = getGroups(bracket);
  const tournament = useTournament();

  return (
    <div className="stack lg">
      {groups.map(({ groupName, groupId }) => {
        const rounds = bracket.data.round.filter((r) => r.group_id === groupId);

        return (
          <div key={groupName} className="stack md">
            <h2 className="text-lg">{groupName}</h2>
            <div
              className="elim-bracket__container"
              style={{ "--round-count": rounds.length } as any}
            >
              {rounds.flatMap((round) => {
                const bestOf = tournament.ctx.bestOfs.find(
                  ({ roundId }) => roundId === round.id,
                )?.bestOf;

                const matches = bracket.data.match.filter(
                  (match) => match.round_id === round.id,
                );

                const someMatchOngoing = matches.some(
                  (match) =>
                    match.opponent1 &&
                    match.opponent2 &&
                    match.opponent1.result !== "win" &&
                    match.opponent2.result !== "win",
                );

                return (
                  <div key={round.id} className="elim-bracket__round-column">
                    <RoundHeader
                      roundId={round.id}
                      name={`Round ${round.number}`}
                      bestOf={bestOf}
                      showInfos={someMatchOngoing}
                    />
                    <div className="elim-bracket__round-matches-container">
                      {matches.map((match) => {
                        if (!match.opponent1 || !match.opponent2) {
                          return null;
                        }

                        return (
                          <Match
                            key={match.id}
                            match={match}
                            roundNumber={round.number}
                            isPreview={bracket.preview}
                            showSimulation={false}
                            bracket={bracket}
                            type="groups"
                            group={groupName.split(" ")[1]}
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function getGroups(bracket: BracketType) {
  const result: Array<{
    groupName: string;
    matches: MatchType[];
    groupId: number;
  }> = [];

  for (const group of bracket.data.group) {
    const matches = bracket.data.match.filter(
      (match) => match.group_id === group.id,
    );

    const numberToLetter = (n: number) =>
      String.fromCharCode(65 + n - 1).toUpperCase();

    result.push({
      groupName: `Group ${numberToLetter(group.number)}`,
      matches,
      groupId: group.id,
    });
  }

  return result;
}
