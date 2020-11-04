module.exports = {
  locales: ["en"],
  sourceLocale: "en",
  catalogs: [
    {
      path: "<rootDir>/locale/{locale}/messages",
      include: [
        "./pages/",
        "./components/",
        "./scenes/"
      ],
    },
  ],
}