// separate from brackets-manager as this wasn't part of the original brackets-manager library

import invariant from "tiny-invariant";
import type { DataTypes, ValueToArray } from "~/modules/brackets-manager/types";
import type { InputStage, Match, StageType } from "~/modules/brackets-model";
import { nullFilledArray } from "~/utils/arrays";
import type { Bracket, Standing } from "./Bracket";
import type { TournamentDataTeam } from "./Tournament.server";
import type { TournamentRepositoryInsertableMatch } from "~/features/tournament/TournamentRepository.server";

interface CreateArgs extends Omit<InputStage, "type" | "seeding" | "number"> {
  seeding: Array<{ id: number; name: string }>;
}

export function create(args: CreateArgs): ValueToArray<DataTypes> {
  const swissSettings = args.settings?.swiss;

  const groupCount = swissSettings?.groupCount ?? 1;
  const roundCount = swissSettings?.roundCount ?? 1;

  const group = nullFilledArray(groupCount).map((_, i) => ({
    id: i,
    stage_id: 0,
    number: i + 1,
  }));

  let roundId = 0;
  return {
    group,
    match: firstRoundMatches({ seeding: args.seeding, groupCount, roundCount }),
    participant: args.seeding.map((p) => ({
      id: p.id,
      name: p.name,
      tournament_id: args.tournamentId,
    })),
    round: group.flatMap((g) =>
      nullFilledArray(roundCount).map((_, i) => ({
        id: roundId++,
        group_id: g.id,
        number: i + 1,
        stage_id: 0,
      })),
    ),
    stage: [
      {
        id: 0,
        name: args.name,
        number: 1,
        settings: args.settings ?? {},
        tournament_id: args.tournamentId,
        // xxx: as problem or not?
        type: "swiss" as StageType,
      },
    ],
  };
}

function firstRoundMatches({
  seeding,
  groupCount,
  roundCount,
}: {
  seeding: CreateArgs["seeding"];
  groupCount: number;
  roundCount: number;
}): Match[] {
  // split the teams to one or more groups. For example with 16 teams and 3 groups this would result in
  // group 1: 1, 4, 7, 10, 13, 16
  // group 2: 2, 5, 8, 11, 14
  // group 3: 3, 6, 9, 12, 15
  const groups = splitToGroups();

  const result: Match[] = [];

  let matchId = 0;
  for (const [groupIdx, participants] of groups.entries()) {
    // if there is an uneven number of teams the last seed gets a bye
    const bye = participants.length % 2 === 0 ? null : participants.pop();

    const halfI = participants.length / 2;
    const upperHalf = participants.slice(0, halfI);
    const lowerHalf = participants.slice(halfI);

    invariant(
      upperHalf.length === lowerHalf.length,
      "firstRoundMatches: halfs not equal",
    );

    // first round every team plays the matching team "on the opposite side"
    // so for example with 8 teams match ups look like this:
    // seed 1 vs. seed 5
    // seed 2 vs. seed 6
    // seed 3 vs. seed 7
    // seed 4 vs. seed 8
    // ---
    // this way each match has "equal distance"
    const roundId = groupIdx * roundCount;
    for (let i = 0; i < upperHalf.length; i++) {
      const upper = upperHalf[i];
      const lower = lowerHalf[i];

      result.push({
        id: matchId++,
        group_id: groupIdx,
        stage_id: 0,
        round_id: roundId,
        number: i + 1,
        opponent1: {
          id: upper.id,
          // xxx: could be that position is unnecessary everywhere
          position: teamIdToPosition(upper.id),
        },
        opponent2: {
          id: lower.id,
          position: teamIdToPosition(lower.id),
        },
        status: 2,
      });
    }

    if (bye) {
      result.push({
        id: matchId++,
        group_id: groupIdx,
        stage_id: 0,
        round_id: roundId,
        number: upperHalf.length + 1,
        opponent1: {
          id: bye.id,
          position: teamIdToPosition(bye.id),
        },
        opponent2: null,
        status: 2,
      });
    }
  }

  return result;

  function splitToGroups() {
    if (!seeding) return [];
    if (groupCount === 1) return [seeding];

    const groups: CreateArgs["seeding"][] = nullFilledArray(groupCount).map(
      () => [],
    );

    for (let i = 0; i < seeding.length; i++) {
      const groupIndex = i % groupCount;
      groups[groupIndex].push(seeding[i]);
    }

    return groups;
  }

  function teamIdToPosition(id: number) {
    return seeding.findIndex((p) => p.id === id) + 1;
  }
}

export function generateMatchUps({
  bracket,
  groupId,
}: {
  bracket: Bracket;
  groupId: number;
}) {
  // lets consider only this groups matches
  // in the case that there are more than one group
  const groupsMatches = bracket.data.match.filter(
    (m) => m.group_id === groupId,
  );

  invariant(groupsMatches.length > 0, "No matches found for group");

  // new matches can't be generated till old are over
  if (!everyMatchOver(groupsMatches)) {
    throw new Error("Not all matches are over");
  }

  const standings = bracket.standings;

  // teams who have dropped out are not considered
  // xxx: standingsWithoutDropouts: read dropout bit
  const standingsWithoutDropouts = standings;

  // if group has uneven number of teams
  // the lowest standing team gets a bye
  // that did not already receive one
  const { bye, play } = splitToByeAndPlay(
    standingsWithoutDropouts,
    groupsMatches,
  );

  // split participating teams to sections
  // each section resolves matches between teams of that section
  // section could look something like this (team counts inaccurate):
  // 3-0'ers - 4 members
  // 2-1'ers - 6 members
  // 1-2'ers - 6 members
  // 0-3'ers - 4 members
  // ---
  // if a section has an uneven number of teams
  // the lowest standing team gets dropped to the section below
  // or if the lowest section is unevent the highest team of the lowest section
  // gets promoted to the section above
  let sections = splitPlayingTeamsToSections(play);

  let iteration = 0;
  let matches: [opponentOneId: number, opponentTwoId: number][] = [];
  while (true) {
    iteration++;
    if (iteration > 100) {
      throw new Error("Swiss bracket generation failed (too many iterations)");
    }

    // lets attempt to create matches for the current sections
    // might fail if some section can't be matches so that nobody replays
    const maybeMatches = sectionsToMatches(sections);

    // ok good matches found!
    if (Array.isArray(maybeMatches)) {
      matches = maybeMatches;
      break;
    }

    // xxx: if sections.length === 1 and got here we need to switch strat

    // let's unify sections so that we can try again with a better chance
    sections = unifySections(sections, maybeMatches.impossibleSectionId);
  }

  // finally lets just convert the generated pairs to match objects
  // for the database
  const newRoundId = bracket.data.round
    .slice()
    .sort((a, b) => a.id - b.id)
    .filter((r) => r.group_id === groupId)
    .find((r) => r.id > groupsMatches[0].round_id)?.id;
  invariant(newRoundId, "newRoundId not found");
  let matchNumber = 1;
  const result: TournamentRepositoryInsertableMatch[] = matches.map(
    ([opponentOneId, opponentTwoId]) => ({
      groupId,
      number: matchNumber++,
      roundId: newRoundId,
      stageId: groupsMatches[0].stage_id,
      opponentOne: JSON.stringify({
        id: opponentOneId,
      }),
      opponentTwo: JSON.stringify({
        id: opponentTwoId,
      }),
    }),
  );

  if (bye) {
    result.push({
      groupId,
      stageId: groupsMatches[0].stage_id,
      roundId: newRoundId,
      number: matchNumber,
      opponentOne: JSON.stringify({
        id: bye.team.id,
      }),
      opponentTwo: JSON.stringify(null),
    });
  }

  return result;
}

function everyMatchOver(matches: Match[]) {
  for (const match of matches) {
    // bye
    if (!match.opponent1 || !match.opponent2) continue;

    if (match.opponent1.result !== "win" && match.opponent2.result !== "win") {
      return false;
    }
  }

  return true;
}

function splitToByeAndPlay(standings: Standing[], matches: Match[]) {
  if (standings.length % 2 === 0) {
    return {
      bye: null,
      play: standings,
    };
  }

  const teamsThatHaveHadByes = matches
    .filter((m) => m.opponent2 === null)
    .map((m) => m.opponent1?.id);

  const play = standings.slice();
  const bye = play
    .slice()
    .reverse()
    .find((s) => !teamsThatHaveHadByes.includes(s.team.id));

  // should not happen
  if (!bye) {
    const reBye = play[play.length - 1];

    return {
      bye: reBye,
      play: play.filter((s) => s.team.id !== reBye.team.id),
    };
  }

  return {
    bye: bye,
    play: play.filter((s) => s.team.id !== bye.team.id),
  };
}

type TournamentDataTeamSections = TournamentDataTeam[][];

function splitPlayingTeamsToSections(
  standings: Standing[],
): TournamentDataTeamSections {
  standings[0].stats?.mapWins;
  return [];
}

function sectionsToMatches(
  _sections: TournamentDataTeamSections,
):
  | [opponentOneId: number, opponentTwoId: number][]
  | { impossibleSectionId: number } {
  return [];
}

function unifySections(
  sections: TournamentDataTeamSections,
  _sectionToUnifyId: number,
): TournamentDataTeamSections {
  return sections;
}
