/**
 * @type {import('@remix-run/dev').AppConfig}
 */
module.exports = {
  ignoredRouteFiles: ["**/.*", "**/*.json"],
  cacheDirectory: process.env.NODE_ENV === "test" ? ".cache-test" : undefined,
};
