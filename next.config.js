const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

module.exports = withBundleAnalyzer({
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
    domains: ["flagcdn.com"],
  },
  eslint: {
    dirs: ["pages", "components", "services", "hooks", "utils"],
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
