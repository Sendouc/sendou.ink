import { useSearchParams } from "@remix-run/react";
import * as React from "react";

/** State backed search params. Used when you want to update search params without triggering navigation (runs loaders, rerenders the whole page extra time) */
export function useSearchParamState<T>({
  defaultValue,
  name,
  revive,
}: {
  defaultValue: T;
  name: string;
  revive: (value: string) => T | null | undefined;
}) {
  const [initialSearchParams] = useSearchParams();
  const [state, setState] = React.useState<T>(resolveInitialState());

  const handleChange = React.useCallback(
    (newValue: T) => {
      setState(newValue);

      const searchParams = new URLSearchParams(window.location.search);
      searchParams.set(name, String(newValue));

      window.history.replaceState(
        {},
        "",
        `${window.location.pathname}?${String(searchParams)}`
      );
    },
    [name]
  );

  return [state, handleChange] as const;

  function resolveInitialState() {
    const value = initialSearchParams.get(name);
    if (value === null || value === undefined) {
      return defaultValue;
    }

    return revive(value) ?? defaultValue;
  }
}
