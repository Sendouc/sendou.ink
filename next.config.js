const withImages = require("next-images");

module.exports = withImages({
  async redirects() {
    return [
      {
        source: "/sr",
        destination: "/sr/leaderboards",
        permanent: true,
      },
    ];
  },
  experimental: {
    optimizeFonts: true,
  },
  images: {
    domains: ["www.countryflags.io"],
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
