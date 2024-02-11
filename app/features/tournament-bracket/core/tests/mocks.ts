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
        size: 4,
        seedOrdering: ["groups.seed_optimized"],
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

export const FIVE_TEAMS_RR = (): ValueToArray<DataTypes> => ({
  stage: [
    {
      id: 0,
      tournament_id: 3,
      name: "Groups stage",
      type: "round_robin",
      number: 1,
      settings: {
        groupCount: 1,
        seedOrdering: ["groups.seed_optimized"],
        roundRobinMode: "simple",
        size: 5,
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
    {
      id: 3,
      number: 4,
      stage_id: 0,
      group_id: 0,
    },
    {
      id: 4,
      number: 5,
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
      status: 2,
      opponent1: {
        id: 4,
        position: 5,
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
      id: 3,
      number: 2,
      stage_id: 0,
      group_id: 0,
      round_id: 1,
      status: 2,
      opponent1: {
        id: 4,
        position: 5,
      },
      opponent2: {
        id: 3,
        position: 4,
      },
    },
    {
      id: 4,
      number: 1,
      stage_id: 0,
      group_id: 0,
      round_id: 2,
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
      id: 5,
      number: 2,
      stage_id: 0,
      group_id: 0,
      round_id: 2,
      status: 2,
      opponent1: {
        id: 0,
        position: 1,
      },
      opponent2: {
        id: 4,
        position: 5,
      },
    },
    {
      id: 6,
      number: 1,
      stage_id: 0,
      group_id: 0,
      round_id: 3,
      status: 2,
      opponent1: {
        id: 2,
        position: 3,
      },
      opponent2: {
        id: 4,
        position: 5,
      },
    },
    {
      id: 7,
      number: 2,
      stage_id: 0,
      group_id: 0,
      round_id: 3,
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
    {
      id: 8,
      number: 1,
      stage_id: 0,
      group_id: 0,
      round_id: 4,
      status: 2,
      opponent1: {
        id: 3,
        position: 4,
      },
      opponent2: {
        id: 0,
        position: 1,
      },
    },
    {
      id: 9,
      number: 2,
      stage_id: 0,
      group_id: 0,
      round_id: 4,
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
      id: 1,
      number: 2,
      stage_id: 0,
      group_id: 0,
      round_id: 0,
      status: 2,
      opponent1: {
        id: 3,
        position: 4,
      },
      opponent2: {
        id: 2,
        position: 3,
      },
    },
  ],
  participant: [
    {
      id: 0,
      tournament_id: 3,
      name: "Team 1",
    },
    {
      id: 1,
      tournament_id: 3,
      name: "Team 2",
    },
    {
      id: 2,
      tournament_id: 3,
      name: "Team 3",
    },
    {
      id: 3,
      tournament_id: 3,
      name: "Team 4",
    },
    {
      id: 4,
      tournament_id: 3,
      name: "Team 5",
    },
  ],
});

export const SIX_TEAMS_TWO_GROUPS_RR = (): ValueToArray<DataTypes> => ({
  stage: [
    {
      id: 0,
      tournament_id: 3,
      name: "Groups stage",
      type: "round_robin",
      number: 1,
      settings: {
        groupCount: 2,
        seedOrdering: ["groups.seed_optimized"],
        roundRobinMode: "simple",
        size: 6,
      },
    },
  ],
  group: [
    {
      id: 0,
      stage_id: 0,
      number: 1,
    },
    {
      id: 1,
      stage_id: 0,
      number: 2,
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
    {
      id: 3,
      number: 1,
      stage_id: 0,
      group_id: 1,
    },
    {
      id: 4,
      number: 2,
      stage_id: 0,
      group_id: 1,
    },
    {
      id: 5,
      number: 3,
      stage_id: 0,
      group_id: 1,
    },
  ],
  match: [
    {
      id: 0,
      number: 1,
      stage_id: 0,
      group_id: 0,
      round_id: 0,
      status: 2,
      opponent1: {
        id: 4,
        position: 5,
      },
      opponent2: {
        id: 3,
        position: 4,
      },
    },
    {
      id: 1,
      number: 1,
      stage_id: 0,
      group_id: 0,
      round_id: 1,
      status: 2,
      opponent1: {
        id: 0,
        position: 1,
      },
      opponent2: {
        id: 4,
        position: 5,
      },
    },
    {
      id: 2,
      number: 1,
      stage_id: 0,
      group_id: 0,
      round_id: 2,
      status: 2,
      opponent1: {
        id: 3,
        position: 4,
      },
      opponent2: {
        id: 0,
        position: 1,
      },
    },
    {
      id: 3,
      number: 1,
      stage_id: 0,
      group_id: 1,
      round_id: 3,
      status: 2,
      opponent1: {
        id: 5,
        position: 6,
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
      group_id: 1,
      round_id: 4,
      status: 2,
      opponent1: {
        id: 1,
        position: 2,
      },
      opponent2: {
        id: 5,
        position: 6,
      },
    },
    {
      id: 5,
      number: 1,
      stage_id: 0,
      group_id: 1,
      round_id: 5,
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
  ],
  participant: [
    {
      id: 0,
      tournament_id: 3,
      name: "Team 1",
    },
    {
      id: 1,
      tournament_id: 3,
      name: "Team 2",
    },
    {
      id: 2,
      tournament_id: 3,
      name: "Team 3",
    },
    {
      id: 3,
      tournament_id: 3,
      name: "Team 4",
    },
    {
      id: 4,
      tournament_id: 3,
      name: "Team 5",
    },
    {
      id: 5,
      tournament_id: 3,
      name: "Team 6",
    },
  ],
});
