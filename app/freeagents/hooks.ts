import { Playstyle } from "@prisma/client";
import { countries } from "countries-list";
import { useUser } from "hooks/common";
import { useRouter } from "next/router";
import { Dispatch, useMemo, useReducer } from "react";
import { setSearchParams } from "utils/setSearchParams";
import { trpc } from "utils/trpc";

type Region = "EUROPE" | "AMERICAS" | "ASIA";

export interface UseFreeAgentsState {
  playstyle?: Playstyle;
  weapon?: string;
  region?: Region;
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
    }
  | {
      type: "SET_WEAPON";
      value?: string;
    }
  | {
      type: "SET_REGION";
      value?: Region;
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
        case "SET_WEAPON":
          return { ...oldState, weapon: action.value };
        case "SET_REGION":
          return { ...oldState, region: action.value };
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

  const continentCodeToRegion = new Map<string, Region>([
    ["AF", "EUROPE"],
    ["AN", "EUROPE"],
    ["AS", "ASIA"],
    ["EU", "EUROPE"],
    ["NA", "AMERICAS"],
    ["OC", "ASIA"],
    ["SA", "AMERICAS"],
  ]);

  const countryCodeToRegion = useMemo(() => {
    return Object.entries(countries).reduce((acc, cur) => {
      acc.set(cur[0], continentCodeToRegion.get(cur[1].continent)!);
      return acc;
    }, new Map<string, Region>());
  }, []);

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

    if (
      state.weapon &&
      !post.user.profile?.weaponPool.some((wpn) => wpn === state.weapon)
    ) {
      return false;
    }

    if (state.region && !post.user.profile?.country) return false;
    if (state.region && post.user.profile?.country) {
      return (
        countryCodeToRegion.get(post.user.profile.country) === state.region
      );
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
