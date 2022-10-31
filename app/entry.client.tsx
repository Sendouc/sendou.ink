import { RemixBrowser } from "@remix-run/react";
import { hydrateRoot } from "react-dom/client";
import { i18nLoader } from "./modules/i18n";
import i18next from "i18next";
import { I18nextProvider } from "react-i18next";

i18nLoader()
  .then(() =>
    hydrateRoot(
      document,
      <I18nextProvider i18n={i18next}>
        <RemixBrowser />
      </I18nextProvider>
    )
  )
  .catch(console.error);
