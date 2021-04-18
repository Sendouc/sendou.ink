import { Playstyle } from "@prisma/client";
import { countries } from "countries-list";
import { useUser } from "hooks/common";
import { useRouter } from "next/router";
import { Dispatch, useMemo, useReducer } from "react";
import { setManySearchParams, setSearchParams } from "utils/setSearchParams";
import { getBooleanFromString, getWeaponFromString } from "utils/strings";
import { trpc } from "utils/trpc";
import { isFreeAgentPlaystyle, isFreeAgentRegion } from "utils/typeGuards";

export type FreeAgentRegion = "EUROPE" | "AMERICAS" | "ASIA";

export interface UseFreeAgentsState {
  playstyle?: Playstyle;
  weapon?: string;
  region?: FreeAgentRegion;
  xp: boolean;
  plusServer: boolean;
}

type Action =
  | {
      type: "SET_PLAYSTYLE";
      value?: Playstyle;
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
      value?: FreeAgentRegion;
    }
  | {
      type: "RESET_FILTERS";
    };

export type UseFreeAgentsDispatch = Dispatch<Action>;

const defaultState: UseFreeAgentsState = { xp: false, plusServer: false };

export function useFreeAgents() {
  const router = useRouter();
  const [user] = useUser();

  const posts = trpc.useQuery(["freeAgents.posts"], {
    enabled: false,
  });

  const usersPost = posts.data?.find(
    (post) => post.user.discordId === user?.discordId
  );

  const { data: likesData } = trpc.useQuery(["freeAgents.likes"], {
    enabled: !!usersPost,
  });

  const [state, dispatch] = useReducer(
    (oldState: UseFreeAgentsState, action: Action) => {
      switch (action.type) {
        case "SET_PLAYSTYLE":
          setSearchParams("playstyle", action.value);

          return { ...oldState, playstyle: action.value };
        case "SET_XP_VALUE":
          setSearchParams("xp", "" + action.value);

          return { ...oldState, xp: action.value };
        case "SET_PLUS_SERVER_VALUE":
          setSearchParams("plusServer", "" + action.value);

          return { ...oldState, plusServer: action.value };
        case "SET_WEAPON":
          setSearchParams("weapon", action.value);

          return { ...oldState, weapon: action.value };
        case "SET_REGION":
          setSearchParams("region", action.value);

          return { ...oldState, region: action.value };
        case "RESET_FILTERS":
          setManySearchParams([], true);

          return defaultState;
        default:
          return oldState;
      }
    },
    getInitialState()
  );

  function getInitialState() {
    const result: UseFreeAgentsState = { ...defaultState };
    if (isFreeAgentPlaystyle(router.query.playstyle)) {
      result.playstyle = router.query.playstyle;
    }

    const xp = getBooleanFromString(router.query.xp);
    if (xp !== undefined) {
      result.xp = xp;
    }

    const plusServer = getBooleanFromString(router.query.plusServer);
    if (plusServer !== undefined) {
      result.plusServer = plusServer;
    }

    const weapon = getWeaponFromString(router.query.weapon);
    if (weapon) {
      result.weapon = weapon;
    }

    if (isFreeAgentRegion(router.query.region)) {
      result.region = router.query.region;
    }

    return result;
  }

  const continentCodeToRegion = new Map<string, FreeAgentRegion>([
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
    }, new Map<string, FreeAgentRegion>());
  }, []);

  const filteredPostsData = (posts.data ?? []).filter((post) => {
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
    refetchPosts: posts.refetch,
    allPostsCount: (posts.data ?? []).length,
    likesData,
    isLoading: !posts.data,
    usersPost,
    matchedPosts: (likesData?.matchedPostIds ?? []).map((id) =>
      (filteredPostsData ?? []).find((post) => post.id === id)
    ),
    state,
    dispatch,
  };
}
