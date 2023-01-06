/**
 * @type {import('@remix-run/dev').AppConfig}
 */
module.exports = {
  ignoredRouteFiles: ["**/.*", "**/*.json", "**/components/*"],
  cacheDirectory: process.env.NODE_ENV === "test" ? ".cache-test" : undefined,
  routes: async (defineRoutes) => {
    return defineRoutes((route) => {
      route("/plans", "features/map-planner/routes/plans.tsx");
      route("/analyzer", "features/build-analyzer/routes/analyzer.tsx");
      route(
        "/object-damage-calculator",
        "features/object-damage-calculator/routes/object-damage-calculator.tsx"
      );
      route("/to/:id", "features/tournament/routes/to.$id.tsx", () => {
        route("/to/:id", "features/tournament/routes/to.$id.index.tsx");
        route(
          "/to/:id/register",
          "features/tournament/routes/to.$id.register.tsx"
        );
        route("/to/:id/teams", "features/tournament/routes/to.$id.teams.tsx");
        route("/to/:id/join", "features/tournament/routes/to.$id.join.tsx");
      });

      route("/t/:customUrl", "features/team/routes/t.$customUrl.tsx");
      route("/t/:customUrl/edit", "features/team/routes/t.$customUrl.edit.tsx");
      route(
        "/t/:customUrl/roster",
        "features/team/routes/t.$customUrl.roster.tsx"
      );
    });
  },
};
