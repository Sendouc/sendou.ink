const withImages = require("next-images");
module.exports = withImages({
  async rewrites() {
    return [
      // check if Next.js project routes match before we attempt proxying
      {
        source: "/:path*",
        destination: "/:path*",
      },
      {
        source: "/:path*",
        destination: `https://sendou-ink.herokuapp.com/:path*`,
      },
    ];
  },
  // i18n: {
  //  v-- import from lib/locales
  //   locales: [
  //     "de",
  //     "el",
  //     "en",
  //     "es",
  //     "fr",
  //     "it",
  //     "ja",
  //     "ko",
  //     "nl",
  //     "pt",
  //     "ru",
  //     "sv",
  //     "zh",
  //   ],
  //   defaultLocale: "en",
  // },
});
