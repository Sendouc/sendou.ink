// separate from brackets-manager as this wasn't part of the original brackets-manager library

import invariant from "tiny-invariant";
import type { DataTypes, ValueToArray } from "~/modules/brackets-manager/types";
import type { InputStage, Match, StageType } from "~/modules/brackets-model";
import { nullFilledArray } from "~/utils/arrays";

interface CreateArgs extends Omit<InputStage, "type" | "seeding"> {
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

  return {
    group,
    match: firstRoundMatches({ seeding: args.seeding, groupCount }),
    participant: args.seeding.map((p) => ({
      id: p.id,
      name: p.name,
      tournament_id: args.tournamentId,
    })),
    round: group.flatMap((g) =>
      nullFilledArray(roundCount).map((_, i) => ({
        id: i,
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
}: {
  seeding: CreateArgs["seeding"];
  groupCount: number;
}): Match[] {
  const groups = splitToGroups();

  const result: Match[] = [];
  for (const [groupIdx, participants] of groups.entries()) {
    const bye = participants.length % 2 === 0 ? null : participants.pop();

    // split in half
    const halfI = participants.length / 2;
    const upperHalf = participants.slice(0, halfI);
    const lowerHalf = participants.slice(halfI);

    invariant(
      upperHalf.length === lowerHalf.length,
      "firstRoundMatches: halfs not equal",
    );

    for (let i = 0; i < upperHalf.length; i++) {
      const upper = upperHalf[i];
      const lower = lowerHalf[i];

      result.push({
        id: i,
        group_id: groupIdx,
        stage_id: 0,
        round_id: 0,
        // xxx: what to put here?
        number: i + 1,
        opponent1: {
          id: upper.id,
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
        id: result.length,
        group_id: groupIdx,
        stage_id: 0,
        round_id: 0,
        // xxx: what to put here?
        number: result.length + 1,
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
