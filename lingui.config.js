import { locales } from "./lib/lists/locales";

module.exports = {
  locales,
  sourceLocale: "en",
  fallbackLocales: { "en-US": "en" },
  orderBy: "origin",
  catalogs: [
    {
      path: "<rootDir>/locale/{locale}/messages",
      include: [
        "./pages/",
        "./components/",
        "./scenes/",
        "./lib/useAbilityEffects",
      ],
    },
    {
      path: "<rootDir>/locale/{locale}/game",
      include: ["./lib/lists"],
    },
  ],
};
