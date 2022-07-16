import { RemixBrowser } from "@remix-run/react";
import { hydrateRoot } from "react-dom/client";
import { i18nLoader } from "./modules/i18n";
import i18next from "i18next";
import { I18nextProvider } from "react-i18next";

i18nLoader().then(hydrate).catch(console.error);

// work around for react 18 + cypress problem - https://github.com/remix-run/remix/issues/2570#issuecomment-1099696456
function hydrate() {
  if (process.env.NODE_ENV === "test") {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require("react-dom").hydrate(
      <I18nextProvider i18n={i18next}>
        <RemixBrowser />
      </I18nextProvider>,
      document
    );
  } else {
    return hydrateRoot(
      document,
      <I18nextProvider i18n={i18next}>
        <RemixBrowser />
      </I18nextProvider>
    );
  }
}
