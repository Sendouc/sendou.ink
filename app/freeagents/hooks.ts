import { Playstyle } from "@prisma/client";
import { useUser } from "hooks/common";
import { useRouter } from "next/router";
import { Dispatch, useReducer } from "react";
import { setSearchParams } from "utils/setSearchParams";
import { trpc } from "utils/trpc";

export interface UseFreeAgentsState {
  playstyle?: Playstyle;
  weapon?: string;
  xp: boolean;
  plusServer: boolean;
}

type Action =
  | {
      type: "SET_PLAYSTYLE";
      playstyle?: Playstyle;
    }
  | {
      type: "SET_XP_VALUE";
      value: boolean;
    }
  | {
      type: "SET_PLUS_SERVER_VALUE";
      value: boolean;
    };

export type UseFreeAgentsDispatch = Dispatch<Action>;

export function useFreeAgents() {
  const router = useRouter();
  const [user] = useUser();

  const { data: postsData } = trpc.useQuery(
    ["freeAgents.posts"] /*{
    enabled: false,
  }*/
  );

  const usersPost = postsData?.find(
    (post) => post.user.discordId === user?.discordId
  );

  const { data: likesData } = trpc.useQuery(["freeAgents.likes"], {
    enabled: !!usersPost,
  });

  const [state, dispatch] = useReducer(
    (oldState: UseFreeAgentsState, action: Action) => {
      switch (action.type) {
        case "SET_PLAYSTYLE":
          setSearchParams("playstyle", action.playstyle);

          return { ...oldState, playstyle: action.playstyle };
        case "SET_XP_VALUE":
          return { ...oldState, xp: action.value };
        case "SET_PLUS_SERVER_VALUE":
          return { ...oldState, plusServer: action.value };
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
      return { xp: false, plusServer: false };
    }

    return {
      playstyle: router.query.playstyle as Playstyle,
      xp: false,
      plusServer: false,
    };
  }

  const filteredPostsData = (postsData ?? []).filter((post) => {
    if (state.playstyle && !post.playstyles.includes(state.playstyle)) {
      return false;
    }

    if (state.xp && !post.user.player?.placements[0]?.xPower) {
      return false;
    }

    if (state.plusServer && !post.user.plusStatus?.membershipTier) {
      return false;
    }

    return true;
  });

  return {
    postsData: filteredPostsData,
    allPostsCount: (postsData ?? []).length,
    likesData,
    isLoading: !postsData,
    usersPost,
    matchedPosts: (likesData?.matchedPostIds ?? []).map((id) =>
      (filteredPostsData ?? []).find((post) => post.id === id)
    ),
    state,
    dispatch,
  };
}
