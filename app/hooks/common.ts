import * as React from "react";
import { useLoaderData, useMatches, useNavigate } from "remix";
import type { SSETarget } from "server/events";
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
  target: SSETarget,
  handleEvent: (data: unknown) => void
) => {
  React.useEffect(() => {
    const source = new EventSource(
      `/events?${new URLSearchParams(target).toString()}`
    );

    // source.addEventListener("open", () => {
    //   console.log("SSE opened!");
    // });

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

/** @link https://usehooks.com/useOnClickOutside/ */
export function useOnClickOutside<T extends HTMLElement = HTMLElement>(
  ref: React.RefObject<T>,
  handler: (event: MouseEvent | TouchEvent) => void
) {
  React.useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler(event);
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}

/** Refreshed loader data of the current route in an interval.
 * @returns Timestamp last updated
 */
export function usePolling(pollingActive = true) {
  const [lastUpdated, setLastUpdated] = React.useState(new Date());
  const data = useLoaderData<unknown>();
  const navigate = useNavigate();

  const INTERVAL = 30_000; // 30 seconds

  React.useEffect(() => {
    if (!pollingActive) return;
    const timer = setTimeout(() => {
      navigate(".");
    }, INTERVAL);

    return () => clearTimeout(timer);
  }, [pollingActive, navigate, data]);

  React.useEffect(() => {
    setLastUpdated(new Date());
  }, [data]);

  return lastUpdated;
}
