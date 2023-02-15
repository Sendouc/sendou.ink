// temporary workaround before Remix has React Router 6.4
// https://github.com/remix-run/remix/issues/186#issuecomment-1178395835

import { ScrollRestoration, useLocation } from "@remix-run/react";
import * as React from "react";

export function ConditionalScrollRestoration() {
  const isFirstRenderRef = React.useRef(true);
  const location = useLocation();

  React.useEffect(() => {
    isFirstRenderRef.current = false;
  }, []);

  if (
    !isFirstRenderRef.current &&
    location.state != null &&
    typeof location.state === "object" &&
    (location.state as { scroll: boolean }).scroll === false
  ) {
    return null;
  }

  return <ScrollRestoration getKey={(location) => location.pathname} />;
}
