import type { DataTypes, ValueToArray } from "~/modules/brackets-manager/types";

export const FOUR_TEAMS_RR = (): ValueToArray<DataTypes> => ({
  stage: [
    {
      id: 0,
      tournament_id: 1,
      name: "Groups stage",
      type: "round_robin",
      number: 1,
      settings: {
        groupCount: 1,
        roundRobinMode: "simple",
        matchesChildCount: 0,
        size: 4,
        seedOrdering: ["groups.effort_balanced"],
      },
    },
  ],
  group: [
    {
      id: 0,
      stage_id: 0,
      number: 1,
    },
  ],
  round: [
    {
      id: 0,
      number: 1,
      stage_id: 0,
      group_id: 0,
    },
    {
      id: 1,
      number: 2,
      stage_id: 0,
      group_id: 0,
    },
    {
      id: 2,
      number: 3,
      stage_id: 0,
      group_id: 0,
    },
  ],
  match: [
    {
      id: 0,
      number: 1,
      stage_id: 0,
      group_id: 0,
      round_id: 0,
      child_count: 0,
      status: 2,
      opponent1: {
        id: 0,
        position: 1,
      },
      opponent2: {
        id: 3,
        position: 4,
      },
    },
    {
      id: 1,
      number: 2,
      stage_id: 0,
      group_id: 0,
      round_id: 0,
      child_count: 0,
      status: 2,
      opponent1: {
        id: 2,
        position: 3,
      },
      opponent2: {
        id: 1,
        position: 2,
      },
    },
    {
      id: 2,
      number: 1,
      stage_id: 0,
      group_id: 0,
      round_id: 1,
      child_count: 0,
      status: 2,
      opponent1: {
        id: 1,
        position: 2,
      },
      opponent2: {
        id: 3,
        position: 4,
      },
    },
    {
      id: 3,
      number: 2,
      stage_id: 0,
      group_id: 0,
      round_id: 1,
      child_count: 0,
      status: 2,
      opponent1: {
        id: 0,
        position: 1,
      },
      opponent2: {
        id: 2,
        position: 3,
      },
    },
    {
      id: 4,
      number: 1,
      stage_id: 0,
      group_id: 0,
      round_id: 2,
      child_count: 0,
      status: 2,
      opponent1: {
        id: 2,
        position: 3,
      },
      opponent2: {
        id: 3,
        position: 4,
      },
    },
    {
      id: 5,
      number: 2,
      stage_id: 0,
      group_id: 0,
      round_id: 2,
      child_count: 0,
      status: 2,
      opponent1: {
        id: 1,
        position: 2,
      },
      opponent2: {
        id: 0,
        position: 1,
      },
    },
  ],
  match_game: [],
  participant: [
    {
      id: 0,
      tournament_id: 1,
      name: "Team 1",
    },
    {
      id: 1,
      tournament_id: 1,
      name: "Team 2",
    },
    {
      id: 2,
      tournament_id: 1,
      name: "Team 3",
    },
    {
      id: 3,
      tournament_id: 1,
      name: "Team 4",
    },
  ],
});
