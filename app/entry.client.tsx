import { RemixBrowser } from "@remix-run/react";
import { hydrateRoot } from "react-dom/client";
import { i18nLoader } from "./modules/i18n";
import i18next from "i18next";
import { I18nextProvider } from "react-i18next";

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    // we will register it after the page complete the load
    void navigator.serviceWorker.register("/sw.js");
  });
}

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
