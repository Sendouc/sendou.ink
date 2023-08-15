// TODO: could be improved e.g. don't refresh when group has expired

import { useRevalidator } from "@remix-run/react";
import { useVisibilityChange } from "./useVisibilityChange";
import * as React from "react";

// or we got new data in the last 20 seconds
export function useAutoRefresh() {
  const { revalidate } = useRevalidator();
  const visibility = useVisibilityChange();

  React.useEffect(() => {
    // when user comes back to this tab
    if (visibility === "visible") {
      revalidate();
    }

    // ...as well as every 20 seconds
    const interval = setInterval(() => {
      if (visibility === "hidden") return;
      revalidate();
    }, 20 * 1000);

    return () => {
      clearInterval(interval);
    };
  }, [visibility, revalidate]);
}
