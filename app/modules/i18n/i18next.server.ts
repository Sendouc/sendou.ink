import { createCookie } from "@remix-run/node";
import Backend from "i18next-fs-backend";
import { resolve } from "node:path";
import { RemixI18Next } from "remix-i18next";
import { config } from "./config";

const TEN_YEARS_IN_SECONDS = 31_536_000 * 10;

export const i18nCookie = createCookie("i18n", {
  sameSite: "lax",
  path: "/",
  maxAge: TEN_YEARS_IN_SECONDS,
});

export const i18next = new RemixI18Next({
  detection: {
    cookie: i18nCookie,
    supportedLanguages: config.supportedLngs,
    fallbackLanguage: config.fallbackLng,
  },
  i18next: {
    ...config,
    backend: {
      loadPath: resolve("./public/locales/{{lng}}/{{ns}}.json"),
    },
  },
  backend: Backend,
});

export default i18next;
