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
  sourceLocale: "en",
  fallbackLocales: "en",
  orderBy: "origin",
  catalogs: [
    {
      path: "<rootDir>/locale/{locale}/messages",
      include: ["./pages/", "./components/", "./scenes/", "./lib/"],
    },
  ],
};
