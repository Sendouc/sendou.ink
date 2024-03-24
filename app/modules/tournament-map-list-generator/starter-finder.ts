// if one mode -> try to find common, otherwise something neither picked
// if a tie breaker -> random tiebreaker
// seed = always same

import {
  seededRandom,
  type TournamentMapListMap,
  type TournamentMaplistInput,
} from ".";

type StarterMapArgs = Pick<
  TournamentMaplistInput,
  "modesIncluded" | "tiebreakerMaps" | "seed" | "teams"
>;

export function starterMap(args: StarterMapArgs): Array<TournamentMapListMap> {
  const { shuffle } = seededRandom(args.seed);

  // xxx: random common here

  if (!args.tiebreakerMaps.isEmpty()) {
    const randomTiebreaker = shuffle(args.tiebreakerMaps.stageModePairs)[0];

    return [
      {
        mode: randomTiebreaker.mode,
        stageId: randomTiebreaker.stageId,
        source: "TO",
        bannedByTournamentTeamId: undefined,
      },
    ];
  }

  // xxx: TODO: default map from the available modes

  return [];
}
