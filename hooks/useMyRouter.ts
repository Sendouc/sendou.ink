import { NextRouter, useRouter } from "next/router";
import type { URLSearchParams as URLSearchParamsType } from "url";
import * as z from "zod";

type SearchParamsType =
  | string
  | string[]
  | number
  | number[]
  | boolean
  | boolean[]
  | null
  | undefined;

type SearchParamsTuple = [key: string, value: SearchParamsType];

export const adjustedSearchParams = (
  url: string,
  newParams: SearchParamsTuple[],
  clearOthers: boolean
): URLSearchParams => {
  const result = clearOthers
    ? new URLSearchParams()
    : new URL(url).searchParams;

  for (const [key, value] of newParams) {
    result.delete(key);

    if (!value && typeof value !== "boolean") {
      continue;
    }

    if (Array.isArray(value)) {
      for (const element of value) {
        result.append(key, String(element));
      }
      continue;
    }

    result.set(key, String(value));
  }

  result.sort();

  return result;
};

const isSearchParamsTuple = (
  newParams: SearchParamsTuple | SearchParamsTuple[]
): newParams is SearchParamsTuple => {
  return !Array.isArray(newParams[0]);
};

const setRouterSearchParams = (
  router: NextRouter,
  newParams: SearchParamsTuple | SearchParamsTuple[],
  clearOthers: boolean
) => {
  const newSearchParams = adjustedSearchParams(
    window.location.href,
    isSearchParamsTuple(newParams) ? [newParams] : newParams,
    clearOthers
  );

  router.replace(
    `${router.pathname}?${newSearchParams.toString()}`,
    undefined,
    {
      shallow: true,
    }
  );
};

const resetSearchParams = (router: NextRouter) =>
  router.replace(router.pathname, undefined, { shallow: true });

export const useMyRouter = (): NextRouter & {
  resetSearchParams: () => void;
  setSearchParams: (
    newParams: SearchParamsTuple | SearchParamsTuple[],
    clearOthers?: boolean
  ) => void;
} => {
  const router = useRouter();

  return {
    ...router,
    resetSearchParams: () => resetSearchParams(router),
    setSearchParams: (
      newParams: SearchParamsTuple | SearchParamsTuple[],
      clearOthers?: boolean
    ) => setRouterSearchParams(router, newParams, clearOthers ?? false),
  };
};
