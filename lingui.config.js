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
    "zh",
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
        "./lib/useAbilityEffects",
        "./lib/translateThese.ts",
      ],
    },
    {
      path: "<rootDir>/locale/{locale}/game",
      include: ["./lib/lists"],
    },
  ],
};
