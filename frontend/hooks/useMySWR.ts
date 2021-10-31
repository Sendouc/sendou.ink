import useSWR from "swr";
import { Serialized } from "utils/types";

export function useMySWR<T>(key: string | null) {
  return useSWR<Serialized<T>>(key);
}
