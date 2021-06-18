import { SalmonRunRecordCategory } from "@prisma/client";
import { salmonRunCategoryToNatural } from "pages/sr/leaderboards/new";
import { GetAllSalmonRunRecordsData } from "prisma/queries/getAllSalmonRunRecords";
import { useReducer } from "react";
import useSWR from "swr";
import { salmonRunStages } from "utils/lists/stages";
import { useMyRouter } from "./useMyRouter";

export type WeaponsFilter =
  | "NORMAL"
  | "ONE_RANDOM"
  | "FOUR_RANDOM"
  | "FOUR_RANDOM_GRIZZCO";

const allWeaponsFilters = [
  "NORMAL",
  "ONE_RANDOM",
  "FOUR_RANDOM",
  "FOUR_RANDOM_GRIZZCO",
] as WeaponsFilter[];

interface UseSalmonRunRecordsState {
  stage: string;
  category: SalmonRunRecordCategory;
  weaponsFilter: WeaponsFilter[];
}

type Action =
  | {
      type: "SET_STAGE";
      stage: string;
    }
  | {
      type: "SET_CATEGORY";
      category: SalmonRunRecordCategory;
    }
  | {
      type: "SET_WEAPONS_FILTER";
      filter: WeaponsFilter[];
    };

export function useSalmonRunRecords() {
  const router = useMyRouter();
  const { data: recordsData } =
    useSWR<GetAllSalmonRunRecordsData>("/api/sr/records");
  const [state, dispatch] = useReducer(
    (oldState: UseSalmonRunRecordsState, action: Action) => {
      switch (action.type) {
        case "SET_STAGE":
          router.setSearchParams(["stage", action.stage]);

          return { ...oldState, stage: action.stage };
        case "SET_CATEGORY":
          router.setSearchParams(["category", action.category]);

          return { ...oldState, category: action.category };
        case "SET_WEAPONS_FILTER":
          router.setSearchParams(["filter", action.filter]);

          return { ...oldState, weaponsFilter: action.filter };
        default:
          return oldState;
      }
    },
    {
      stage: getInitialStage(),
      category: getInitialCategory(),
      weaponsFilter: getInitialWeaponsFilter(),
    }
  );

  const userIds = new Set<number>();

  const data = (recordsData ?? []).filter((record) => {
    if (record.rotation.stage !== state.stage) return false;
    if (record.category !== state.category) return false;
    if (record.roster.every((user) => userIds.has(user.id))) return false;

    if (
      record.rotation.weapons[0] === "RANDOM_GRIZZCO" &&
      !state.weaponsFilter.includes("FOUR_RANDOM_GRIZZCO")
    ) {
      return false;
    }

    const randomCount = record.rotation.weapons.reduce((acc, cur) => {
      if (cur === "RANDOM") acc++;
      return acc;
    }, 0);

    if (
      randomCount === 0 &&
      record.rotation.weapons[0] !== "RANDOM_GRIZZCO" &&
      !state.weaponsFilter.includes("NORMAL")
    ) {
      return false;
    }
    if (randomCount === 1 && !state.weaponsFilter.includes("ONE_RANDOM")) {
      return false;
    }
    if (randomCount === 4 && !state.weaponsFilter.includes("FOUR_RANDOM")) {
      return false;
    }

    record.roster.forEach((user) => userIds.add(user.id));

    return true;
  });

  return {
    data: data.filter((record) => record.approved),
    pendingCount: data.reduce(
      (acc, record) => (!record.approved ? ++acc : acc),
      0
    ),
    isLoading: !recordsData,
    state,
    dispatch,
  };

  function getInitialStage() {
    if (
      typeof router.query.stage !== "string" ||
      !salmonRunStages.includes(router.query.stage as any)
    ) {
      return "Spawning Grounds";
    }

    return router.query.stage;
  }

  function getInitialCategory() {
    if (
      typeof router.query.category !== "string" ||
      !Object.keys(salmonRunCategoryToNatural).includes(
        router.query.category as any
      )
    ) {
      return "TOTAL";
    }

    return router.query.category as SalmonRunRecordCategory;
  }

  function getInitialWeaponsFilter() {
    if (
      !Array.isArray(router.query.filter) ||
      !router.query.filter.every((filter) =>
        allWeaponsFilters.includes(filter as any)
      ) ||
      router.query.filter.length > allWeaponsFilters.length
    ) {
      return [
        "NORMAL",
        "ONE_RANDOM",
        "FOUR_RANDOM",
        "FOUR_RANDOM_GRIZZCO",
      ] as WeaponsFilter[];
    }

    return router.query.filter as WeaponsFilter[];
  }
}
