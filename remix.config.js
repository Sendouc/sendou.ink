/**
 * @type {import('@remix-run/dev').AppConfig}
 */
module.exports = {
  ignoredRouteFiles: ["**/.*", "**/*.json", "**/components/*"],
  cacheDirectory: process.env.NODE_ENV === "test" ? ".cache-test" : undefined,
  routes: async (defineRoutes) => {
    return defineRoutes((route) => {
      route("/upload", "features/img-upload/routes/upload.tsx");
      route("/upload/admin", "features/img-upload/routes/upload.admin.tsx");
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
        route("/to/:id/admin", "features/tournament/routes/to.$id.admin.tsx");
        route("/to/:id/maps", "features/tournament/routes/to.$id.maps.tsx");

        route(
          "/to/:id/brackets",
          "features/tournament-bracket/routes/to.$id.brackets.tsx"
        );
        route(
          "/to/:id/matches/:mid",
          "features/tournament-bracket/routes/to.$id.matches.$mid.tsx"
        );
        route(
          "/to/:id/matches/:mid/subscribe",
          "features/tournament-bracket/routes/to.$id.matches.$mid.subscribe.tsx"
        );
      });

      route("/privacy-policy", "features/info/routes/privacy-policy.tsx");
      route("/support", "features/info/routes/support.tsx");

      route("/t", "features/team/routes/t.tsx");
      route("/t/:customUrl", "features/team/routes/t.$customUrl.tsx");
      route("/t/:customUrl/edit", "features/team/routes/t.$customUrl.edit.tsx");
      route(
        "/t/:customUrl/roster",
        "features/team/routes/t.$customUrl.roster.tsx"
      );
      route("/t/:customUrl/join", "features/team/routes/t.$customUrl.join.tsx");

      route("/vods", "features/vods/routes/vods.tsx");
      route("/vods/new", "features/vods/routes/vods.new.tsx");
      route("/vods/:id", "features/vods/routes/vods.$id.tsx");

      route(
        "/builds/:slug/stats",
        "features/build-stats/routes/builds.$slug.stats.tsx"
      );
      route(
        "/builds/:slug/popular",
        "features/build-stats/routes/builds.$slug.popular.tsx"
      );

      route("/xsearch", "features/top-search/routes/xsearch.tsx");
      route(
        "/xsearch/player/:id",
        "features/top-search/routes/xsearch.player.$id.tsx"
      );
    });
  },
  future: {
    v2_meta: true,
  },
};
