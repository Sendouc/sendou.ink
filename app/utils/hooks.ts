import { useMatches, useTransition } from "remix";
import { LoggedInUser } from ".";
import * as React from "react";

export const useUser = () => {
  const [root] = useMatches();

  return root.data.user as LoggedInUser;
};

export const useBaseURL = () => {
  const [root] = useMatches();

  return root.data.baseURL as string;
};

export const useIsSubmitting = (method: "POST" | "DELETE") => {
  const transition = useTransition();

  return (
    transition.state !== "idle" && transition.submission?.method === method
  );
};

/** @link https://stackoverflow.com/a/64983274 */
export const useTimeoutState = <T>(
  defaultState: T
): [
  T,
  (action: React.SetStateAction<T>, opts?: { timeout: number }) => void
] => {
  const [state, _setState] = React.useState<T>(defaultState);
  const [currentTimeoutId, setCurrentTimeoutId] = React.useState<
    NodeJS.Timeout | undefined
  >();

  const setState = React.useCallback(
    (action: React.SetStateAction<T>, opts?: { timeout: number }) => {
      if (currentTimeoutId != null) {
        clearTimeout(currentTimeoutId);
      }

      _setState(action);

      const id = setTimeout(() => _setState(defaultState), opts?.timeout);
      setCurrentTimeoutId(id);
    },
    [currentTimeoutId, defaultState]
  );
  return [state, setState];
};
