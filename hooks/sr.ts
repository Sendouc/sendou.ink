import { SalmonRunRecordCategory } from "@prisma/client";
import { salmonRunStages } from "lib/lists/stages";
import { useRouter } from "next/router";
import { salmonRunCategoryToNatural } from "pages/sr/leaderboards/new";
import { GetAllSalmonRunRecordsData } from "prisma/queries/getAllSalmonRunRecords";
import { useReducer } from "react";
import useSWR from "swr";

interface UseSalmonRunRecordsState {
  stage: string;
  category: SalmonRunRecordCategory;
}

type Action =
  | {
      type: "SET_STAGE";
      stage: string;
    }
  | {
      type: "SET_CATEGORY";
      category: SalmonRunRecordCategory;
    };

export function useSalmonRunRecords() {
  const router = useRouter();
  const { data: recordsData } = useSWR<GetAllSalmonRunRecordsData>(
    "/api/sr/records"
  );
  const [state, dispatch] = useReducer(
    (oldState: UseSalmonRunRecordsState, action: Action) => {
      switch (action.type) {
        case "SET_STAGE":
          router.replace({
            pathname: "/sr/leaderboards",
            query: { ...router.query, stage: action.stage },
          });

          return { ...oldState, stage: action.stage };
        case "SET_CATEGORY":
          router.replace({
            pathname: "/sr/leaderboards",
            query: { ...router.query, category: action.category },
          });

          return { ...oldState, category: action.category };
        default:
          return oldState;
      }
    },
    {
      stage: getInitialStage(),
      category: getInitialCategory(),
    }
  );

  const userIds = new Set<number>();

  const data = (recordsData ?? []).filter((record) => {
    if (record.rotation.stage !== state.stage) return false;
    if (record.category !== state.category) return false;
    if (record.roster.every((user) => userIds.has(user.id))) return false;

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
}
