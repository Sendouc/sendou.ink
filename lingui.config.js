module.exports = {
  locales: [
    "de",
    "en",
    "es",
    "fr",
    "it",
    "nl",
    "pt",
    "sv",
    "el",
    "ru",
    "ja",
    "ko",
    "he",
  ],
  format: "minimal",
  sourceLocale: "en",
  fallbackLocales: { "en-US": "en" },
  orderBy: "origin",
  catalogs: [
    {
      path: "<rootDir>/locale/{locale}/messages",
      include: [
        "./pages/",
        "./components/",
        "./utils/useAbilityEffects",
        "./utils/translateThese.ts",
      ],
    },
    {
      path: "<rootDir>/locale/{locale}/game",
      include: ["./utils/lists"],
    },
  ],
};
