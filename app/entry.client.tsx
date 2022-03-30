import { hydrate } from "react-dom";
import { RemixBrowser } from "remix";

// TODO: should this be hydrateRoot?
hydrate(<RemixBrowser />, document);
