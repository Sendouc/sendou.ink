import { Playstyle } from "@prisma/client";
import { setSearchParams } from "lib/setSearchParams";
import useUser from "lib/useUser";
import { useRouter } from "next/router";
import { GetAllFreeAgentPostsData } from "prisma/queries/getAllFreeAgentPosts";
import { useReducer } from "react";
import useSWR from "swr";

interface UseFreeAgentsState {
  playstyle?: Playstyle;
  weapon?: string;
}

type Action = {
  type: "SET_PLAYSTYLE";
  playstyle?: Playstyle;
};

export function useFreeAgents() {
  const router = useRouter();
  const [user] = useUser();
  const { data } = useSWR<GetAllFreeAgentPostsData>("/api/freeagents");
  const [state, dispatch] = useReducer(
    (oldState: UseFreeAgentsState, action: Action) => {
      switch (action.type) {
        case "SET_PLAYSTYLE":
          setSearchParams("playstyle", action.playstyle);

          return { ...oldState, playstyle: action.playstyle };
        default:
          return oldState;
      }
    },
    getInitialState()
  );

  function getInitialState() {
    if (
      typeof router.query.playstyle !== "string" ||
      !["FRONTLINE", "MIDLINE", "BACKLINE"].includes(
        router.query.playstyle as any
      )
    ) {
      return {};
    }

    return { playstyle: router.query.playstyle as Playstyle };
  }

  return {
    data: (data ?? []).filter(
      (post) => !state.playstyle || post.playstyles.includes(state.playstyle)
    ),
    isLoading: !data,
    usersPost: data?.find((post) => post.user.discordId === user?.discordId),
    playstyleCounts: (data ?? []).reduce(
      (acc, cur) => {
        cur.playstyles.forEach((playstyle) => acc[playstyle]++);

        return acc;
      },
      { FRONTLINE: 0, MIDLINE: 0, BACKLINE: 0 }
    ),
    state,
    dispatch,
  };
}
