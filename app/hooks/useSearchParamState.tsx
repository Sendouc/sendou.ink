import { useLocation } from "@remix-run/react";
import * as React from "react";

export function useSearchParamState<T>({
  defaultValue,
  name,
  revive,
}: {
  defaultValue: T;
  name: string;
  revive: (value: string) => T | null | undefined;
}) {
  const location = useLocation();
  const [state, setState] = React.useState<T>(resolveInitialState());

  const handleChange = React.useCallback(
    (newValue: T) => {
      setState(newValue);

      const searchParams = new URLSearchParams(location.search);
      searchParams.set(name, String(newValue));

      window.history.replaceState(
        {},
        "",
        `${location.pathname}?${String(searchParams)}`
      );
    },
    [location, name]
  );

  return [state, handleChange] as const;

  function resolveInitialState() {
    const searchParams = new URLSearchParams(location.search);
    const value = searchParams.get(name);
    if (value === null || value === undefined) {
      return defaultValue;
    }

    return revive(value) ?? defaultValue;
  }
}
