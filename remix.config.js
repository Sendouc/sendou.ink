/**
 * @type {import('@remix-run/dev').AppConfig}
 */
module.exports = {
  ignoredRouteFiles: ["**/.*", "**/*.json", "**/components/*"],
  cacheDirectory: process.env.NODE_ENV === "test" ? ".cache-test" : undefined,
  routes: async (defineRoutes) => {
    return defineRoutes((route) => {
      route(
        "/to/:identifier",
        "features/tournament/routes/to.$identifier.tsx",
        () => {
          route(
            "/to/:identifier",
            "features/tournament/routes/to.$identifier.index.tsx"
          );
          route(
            "/to/:identifier/register",
            "features/tournament/routes/to.$identifier.register.tsx"
          );
        }
      );
    });
  },
};
