import * as React from "react";
import { useMatches } from "remix";
import { z } from "zod";
import { LoggedInUserSchema } from "~/utils/schemas";

export const useUser = () => {
  const [root] = useMatches();

  const parsed = LoggedInUserSchema.parse(root.data);
  return parsed?.user;
};

export const useBaseURL = () => {
  const [root] = useMatches();

  const parsed = z.object({ baseURL: z.string() }).parse(root.data);
  return parsed.baseURL;
};

export const useEvents = (
  bracketId: string,
  handleEvent: (data: unknown) => void
) => {
  React.useEffect(() => {
    const source = new EventSource(
      `/events?type=bracket&bracketId=${bracketId}`
    );

    source.addEventListener("open", () => {
      console.log("SSE opened!");
    });

    source.addEventListener("message", (e) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      handleEvent(JSON.parse(e.data));
    });

    source.addEventListener("error", (e) => {
      console.error("SSE error: ", e);
    });

    return () => {
      source.close();
    };
  }, []);
};

// TODO: fix causes memory leak
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

      const id = setTimeout(
        () => _setState(defaultState),
        opts?.timeout ?? 4000
      );
      setCurrentTimeoutId(id);
    },
    [currentTimeoutId, defaultState]
  );
  return [state, setState];
};
