import { hydrate } from "react-dom";
import { RemixBrowser } from "@remix-run/react";

// TODO: should this be hydrateRoot?
hydrate(<RemixBrowser />, document);
