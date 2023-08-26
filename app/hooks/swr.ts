import useSWRImmutable from "swr/immutable";
import type { WeaponUsageLoaderData } from "~/features/sendouq/routes/weapon-usage";
import type { ModeShort, StageId } from "~/modules/in-game-lists";
import type { EventsWithMapPoolsLoaderData } from "~/routes/calendar/map-pool-events";
import {
  GET_ALL_EVENTS_WITH_MAP_POOLS_ROUTE,
  getWeaponUsage,
} from "~/utils/urls";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  return res.json();
};

export function useAllEventsWithMapPools() {
  const { data, error } = useSWRImmutable<EventsWithMapPoolsLoaderData>(
    GET_ALL_EVENTS_WITH_MAP_POOLS_ROUTE,
    fetcher,
  );

  return {
    events: data?.events,
    isLoading: !error && !data,
    isError: error,
  };
}

export function useWeaponUsage(args: {
  userId: number;
  season: number;
  modeShort: ModeShort;
  stageId: StageId;
}) {
  const { data, error } = useSWRImmutable<WeaponUsageLoaderData>(
    getWeaponUsage(args),
    fetcher,
  );

  return {
    weaponUsage: data?.usage,
    isLoading: !error && !data,
    isError: error,
  };
}
