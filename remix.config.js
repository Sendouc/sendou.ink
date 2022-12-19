/**
 * @type {import('@remix-run/dev').AppConfig}
 */
module.exports = {
  ignoredRouteFiles: ["**/.*", "**/*.json", "**/components/*"],
  cacheDirectory: process.env.NODE_ENV === "test" ? ".cache-test" : undefined,
  routes: async (defineRoutes) => {
    return defineRoutes((route) => {
      route("/to/:id", "features/tournament/routes/to.$id.tsx", () => {
        route("/to/:id", "features/tournament/routes/to.$id.index.tsx");
        route(
          "/to/:id/register",
          "features/tournament/routes/to.$id.register.tsx"
        );
        route("/to/:id/join", "features/tournament/routes/to.$id.join.tsx");
      });
    });
  },
};
