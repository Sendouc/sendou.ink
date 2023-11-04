/**
 * @type {import('@remix-run/dev').AppConfig}
 */
module.exports = {
  ignoredRouteFiles: ["**/.*", "**/*.json", "**/components/*"],
  cacheDirectory: process.env.NODE_ENV === "test" ? ".cache-test" : undefined,
  routes: async (defineRoutes) => {
    return defineRoutes((route) => {
      route("/u", "features/user-search/routes/u.tsx");

      route("/badges", "features/badges/routes/badges.tsx", () => {
        route("/badges/:id", "features/badges/routes/badges.$id.tsx", () => {
          route(
            "/badges/:id/edit",
            "features/badges/routes/badges.$id.edit.tsx",
          );
        });
      });

      route("/calendar", "features/calendar/routes/calendar.tsx");
      route("/calendar/new", "features/calendar/routes/calendar.new.tsx");
      route("/calendar/:id", "features/calendar/routes/calendar.$id.tsx");
      route(
        "/calendar/:id/report-winners",
        "features/calendar/routes/calendar.$id.report-winners.tsx",
      );
      route("/map-pool-events", "features/calendar/routes/map-pool-events.ts");

      route("/upload", "features/img-upload/routes/upload.tsx");
      route("/upload/admin", "features/img-upload/routes/upload.admin.tsx");
      route("/plans", "features/map-planner/routes/plans.tsx");
      route("/analyzer", "features/build-analyzer/routes/analyzer.tsx");
      route(
        "/object-damage-calculator",
        "features/object-damage-calculator/routes/object-damage-calculator.tsx",
      );
      route("/to/:id", "features/tournament/routes/to.$id.tsx", () => {
        route("/to/:id", "features/tournament/routes/to.$id.index.tsx");
        route(
          "/to/:id/register",
          "features/tournament/routes/to.$id.register.tsx",
        );
        route("/to/:id/teams", "features/tournament/routes/to.$id.teams.tsx");
        route(
          "/to/:id/teams/:tid",
          "features/tournament/routes/to.$id.teams.$tid.tsx",
        );
        route("/to/:id/join", "features/tournament/routes/to.$id.join.tsx");
        route("/to/:id/admin", "features/tournament/routes/to.$id.admin.tsx");
        route("/to/:id/seeds", "features/tournament/routes/to.$id.seeds.tsx");
        route("/to/:id/maps", "features/tournament/routes/to.$id.maps.tsx");
        route(
          "/to/:id/streams",
          "features/tournament/routes/to.$id.streams.tsx",
        );

        route(
          "/to/:id/subs",
          "features/tournament-subs/routes/to.$id.subs.tsx",
        );
        route(
          "/to/:id/subs/new",
          "features/tournament-subs/routes/to.$id.subs.new.tsx",
        );

        route(
          "/to/:id/brackets",
          "features/tournament-bracket/routes/to.$id.brackets.tsx",
        );
        route(
          "/to/:id/brackets/subscribe",
          "features/tournament-bracket/routes/to.$id.brackets.subscribe.tsx",
        );
        route(
          "/to/:id/matches/:mid",
          "features/tournament-bracket/routes/to.$id.matches.$mid.tsx",
        );
        route(
          "/to/:id/matches/:mid/subscribe",
          "features/tournament-bracket/routes/to.$id.matches.$mid.subscribe.tsx",
        );
      });

      route("/privacy-policy", "features/info/routes/privacy-policy.tsx");
      route("/support", "features/info/routes/support.tsx");

      route("/t", "features/team/routes/t.tsx");
      route("/t/:customUrl", "features/team/routes/t.$customUrl.tsx");
      route("/t/:customUrl/edit", "features/team/routes/t.$customUrl.edit.tsx");
      route(
        "/t/:customUrl/roster",
        "features/team/routes/t.$customUrl.roster.tsx",
      );
      route("/t/:customUrl/join", "features/team/routes/t.$customUrl.join.tsx");

      route("/vods", "features/vods/routes/vods.tsx");
      route("/vods/new", "features/vods/routes/vods.new.tsx");
      route("/vods/:id", "features/vods/routes/vods.$id.tsx");

      route("/builds", "features/builds/routes/builds.tsx");
      route("/builds/:slug", "features/builds/routes/builds.$slug.tsx");
      route(
        "/builds/:slug/stats",
        "features/build-stats/routes/builds.$slug.stats.tsx",
      );
      route(
        "/builds/:slug/popular",
        "features/build-stats/routes/builds.$slug.popular.tsx",
      );

      route("/xsearch", "features/top-search/routes/xsearch.tsx");
      route(
        "/xsearch/player/:id",
        "features/top-search/routes/xsearch.player.$id.tsx",
      );

      route("/leaderboards", "features/leaderboards/routes/leaderboards.tsx");

      route("/links", "features/links/routes/links.tsx");

      route("/art", "features/art/routes/art.tsx");
      route("/art/new", "features/art/routes/art.new.tsx");

      route("/q", "features/sendouq/routes/q.tsx");
      route("/q/rules", "features/sendouq/routes/q.rules.tsx");
      route("/q/looking", "features/sendouq/routes/q.looking.tsx");
      route("/q/preparing", "features/sendouq/routes/q.preparing.tsx");
      route("/q/match/:id", "features/sendouq/routes/q.match.$id.tsx");

      route("/weapon-usage", "features/sendouq/routes/weapon-usage.tsx");

      route("/tiers", "features/sendouq/routes/tiers.tsx");

      route("/settings", "features/settings/routes/settings.tsx");

      route("/admin", "features/admin/routes/admin.tsx");

      route("/a", "features/articles/routes/a.tsx");
      route("/a/:slug", "features/articles/routes/a.$slug.tsx");

      route("/plus", "features/plus-suggestions/routes/plus.tsx", () => {
        route("/plus", "features/plus-suggestions/routes/plus.index.tsx");

        route(
          "/plus/suggestions",
          "features/plus-suggestions/routes/plus.suggestions.tsx",
          () => {
            route(
              "/plus/suggestions/new",
              "features/plus-suggestions/routes/plus.suggestions.new.tsx",
            );
            route(
              "/plus/suggestions/comment/:tier/:userId",
              "features/plus-suggestions/routes/plus.suggestions.comment.$tier.$userId.tsx",
            );
          },
        );

        route("/plus/list", "features/plus-voting/routes/plus.list.ts");
        route("/plus/voting", "features/plus-voting/routes/plus.voting.tsx");
        route(
          "/plus/voting/results",
          "features/plus-voting/routes/plus.voting.results.tsx",
        );
      });
    });
  },
  serverModuleFormat: "cjs",
  serverDependenciesToBundle: ["react-charts", "d3-time-format"],
  future: {
    v2_meta: true,
    v2_normalizeFormMethod: true,
    v2_dev: true,
    v2_headers: true,
    v2_errorBoundary: true,
  },
};
