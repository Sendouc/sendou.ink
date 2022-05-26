import { RemixBrowser } from "@remix-run/react";
import { hydrateRoot } from "react-dom/client";

// work around for react 18 + cypress problem - https://github.com/remix-run/remix/issues/2570#issuecomment-1099696456
if (process.env.NODE_ENV === "test") {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require("react-dom").hydrate(<RemixBrowser />, document);
} else {
  hydrateRoot(document, <RemixBrowser />);
}
