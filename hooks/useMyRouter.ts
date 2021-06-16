import { NextRouter, useRouter } from "next/router";
import { URLSearchParams } from "url";

type SearchParamsTuple = [
  key: string,
  value:
    | string
    | string[]
    | number
    | number[]
    | boolean
    | boolean[]
    | null
    | undefined
];

export const adjustedSearchParams = (
  url: string,
  newParams: SearchParamsTuple[]
): URLSearchParams => {
  const result = new URL(url).searchParams;

  for (const [key, value] of newParams) {
    if (!value && typeof value !== "boolean") {
      result.delete(key);
      continue;
    }

    if (Array.isArray(value)) {
      result.delete(key);
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
  newParams: SearchParamsTuple | SearchParamsTuple[]
) => {
  const newSearchParams = adjustedSearchParams(
    window.location.href,
    isSearchParamsTuple(newParams) ? [newParams] : newParams
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
  setSearchParams: (newParams: SearchParamsTuple | SearchParamsTuple[]) => void;
} => {
  const router = useRouter();

  return {
    ...router,
    resetSearchParams: () => resetSearchParams(router),
    setSearchParams: (newParams: SearchParamsTuple | SearchParamsTuple[]) =>
      setRouterSearchParams(router, newParams),
  };
};
