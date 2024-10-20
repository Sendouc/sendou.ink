import { vitePlugin as remix } from "@remix-run/dev";
import { installGlobals } from "@remix-run/node";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { configDefaults } from "vitest/config";

installGlobals();

export default defineConfig(() => {
	return {
		ssr: {
			noExternal: ["react-charts", "react-use"],
		},
		plugins: [
			remix({
				ignoredRouteFiles: ["**/.*", "**/*.json", "**/components/*"],
				serverModuleFormat: "esm",
				future: {
					v3_fetcherPersist: true,
					v3_relativeSplatPath: true,
					v3_throwAbortReason: true,
				},
				routes: (defineRoutes) => {
					return defineRoutes((route) => {
						route("/", "features/front-page/routes/index.tsx");

						route("/settings", "features/settings/routes/settings.tsx");

						route(
							"/patrons-list",
							"features/front-page/routes/patrons-list.ts",
						);

						route("/suspended", "features/ban/routes/suspended.tsx");

						route("/u", "features/user-search/routes/u.tsx");

						route(
							"/u/:identifier",
							"features/user-page/routes/u.$identifier.tsx",
							() => {
								route(
									"/u/:identifier",
									"features/user-page/routes/u.$identifier.index.tsx",
								);
								route(
									"/u/:identifier/art",
									"features/user-page/routes/u.$identifier.art.tsx",
								);
								route(
									"/u/:identifier/edit",
									"features/user-page/routes/u.$identifier.edit.tsx",
								);
								route(
									"/u/:identifier/seasons",
									"features/user-page/routes/u.$identifier.seasons.tsx",
								);
								route(
									"/u/:identifier/vods",
									"features/user-page/routes/u.$identifier.vods.tsx",
								);

								route(
									"/u/:identifier/builds",
									"features/user-page/routes/u.$identifier.builds.tsx",
								);
								route(
									"/u/:identifier/builds/new",
									"features/user-page/routes/u.$identifier.builds.new.tsx",
								);

								route(
									"/u/:identifier/results",
									"features/user-page/routes/u.$identifier.results.tsx",
								);
								route(
									"/u/:identifier/results/highlights",
									"features/user-page/routes/u.$identifier.results.highlights.tsx",
								);
							},
						);

						route("/badges", "features/badges/routes/badges.tsx", () => {
							route(
								"/badges/:id",
								"features/badges/routes/badges.$id.tsx",
								() => {
									route(
										"/badges/:id/edit",
										"features/badges/routes/badges.$id.edit.tsx",
									);
								},
							);
						});

						route("/calendar", "features/calendar/routes/calendar.tsx");
						route("/calendar/new", "features/calendar/routes/calendar.new.tsx");
						route("/calendar/:id", "features/calendar/routes/calendar.$id.tsx");
						route(
							"/calendar/:id/report-winners",
							"features/calendar/routes/calendar.$id.report-winners.tsx",
						);
						route(
							"/calendar/map-pool-events",
							"features/calendar/routes/map-pool-events.ts",
						);

						route("/maps", "features/map-list-generator/routes/maps.tsx");

						route("/upload", "features/img-upload/routes/upload.tsx");
						route(
							"/upload/admin",
							"features/img-upload/routes/upload.admin.tsx",
						);
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
							route(
								"/to/:id/teams",
								"features/tournament/routes/to.$id.teams.tsx",
							);
							route(
								"/to/:id/teams/:tid",
								"features/tournament/routes/to.$id.teams.$tid.tsx",
							);
							route(
								"/to/:id/join",
								"features/tournament/routes/to.$id.join.tsx",
							);
							route(
								"/to/:id/admin",
								"features/tournament/routes/to.$id.admin.tsx",
							);
							route(
								"/to/:id/seeds",
								"features/tournament/routes/to.$id.seeds.tsx",
							);
							route(
								"/to/:id/results",
								"features/tournament/routes/to.$id.results.tsx",
							);
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

						route(
							"/org/:slug",
							"features/tournament-organization/routes/org.$slug.tsx",
						);
						route(
							"/org/:slug/edit",
							"features/tournament-organization/routes/org.$slug.edit.tsx",
						);

						route("/faq", "features/info/routes/faq.tsx");
						route("/contributions", "features/info/routes/contributions.tsx");
						route("/privacy-policy", "features/info/routes/privacy-policy.tsx");
						route("/support", "features/info/routes/support.tsx");

						route("/t", "features/team/routes/t.tsx");
						route("/t/:customUrl", "features/team/routes/t.$customUrl.tsx");
						route(
							"/t/:customUrl/edit",
							"features/team/routes/t.$customUrl.edit.tsx",
						);
						route(
							"/t/:customUrl/roster",
							"features/team/routes/t.$customUrl.roster.tsx",
						);
						route(
							"/t/:customUrl/join",
							"features/team/routes/t.$customUrl.join.tsx",
						);

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

						route(
							"/leaderboards",
							"features/leaderboards/routes/leaderboards.tsx",
						);

						route("/links", "features/links/routes/links.tsx");

						route("/art", "features/art/routes/art.tsx");
						route("/art/new", "features/art/routes/art.new.tsx");

						route("/play", "features/sendouq/routes/play.tsx");
						route("/q", "features/sendouq/routes/q.tsx");
						route("/q/rules", "features/sendouq/routes/q.rules.tsx");
						route("/q/info", "features/sendouq/routes/q.info.tsx");
						route("/q/looking", "features/sendouq/routes/q.looking.tsx");
						route("/q/preparing", "features/sendouq/routes/q.preparing.tsx");
						route("/q/match/:id", "features/sendouq/routes/q.match.$id.tsx");

						route("/trusters", "features/sendouq/routes/trusters.ts");

						route(
							"/q/settings",
							"features/sendouq-settings/routes/q.settings.tsx",
						);

						route(
							"/q/streams",
							"features/sendouq-streams/routes/q.streams.tsx",
						);

						route("/weapon-usage", "features/sendouq/routes/weapon-usage.tsx");

						route("/tiers", "features/sendouq/routes/tiers.tsx");

						route("/lfg", "features/lfg/routes/lfg.tsx");
						route("/lfg/new", "features/lfg/routes/lfg.new.tsx");

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
							route(
								"/plus/voting",
								"features/plus-voting/routes/plus.voting.tsx",
							);
							route(
								"/plus/voting/results",
								"features/plus-voting/routes/plus.voting.results.tsx",
							);
						});

						route("/patrons", "features/api-private/routes/patrons.tsx");
						route("/seed", "features/api-private/routes/seed.tsx");
						route("/users", "features/api-private/routes/users.tsx");

						route(
							"/api/user/:identifier",
							"features/api-public/routes/user.$identifier.ts",
						);
						route(
							"/api/calendar/:year/:week",
							"features/api-public/routes/calendar.$year.$week.ts",
						);
						route(
							"/api/tournament/:id",
							"features/api-public/routes/tournament.$id.ts",
						);
						route(
							"/api/tournament/:id/teams",
							"features/api-public/routes/tournament.$id.teams.ts",
						);
						route(
							"/api/tournament/:id/brackets/:bidx",
							"features/api-public/routes/tournament.$id.brackets.$bidx.ts",
						);
						route(
							"/api/tournament/:id/brackets/:bidx/standings",
							"features/api-public/routes/tournament.$id.brackets.$bidx.standings.ts",
						);
						route(
							"/api/tournament-match/:id",
							"features/api-public/routes/tournament-match.$id.ts",
						);
						route("/api/org/:id", "features/api-public/routes/org.$id.ts");

						route("/theme", "features/theme/routes/theme.ts");

						route("/auth", "features/auth/routes/auth.tsx");
						route("/auth/callback", "features/auth/routes/auth.callback.tsx");
						route(
							"/auth/create-link",
							"features/auth/routes/auth.create-link.tsx",
						);
						route("/auth/login", "features/auth/routes/auth.login.tsx");
						route("/auth/logout", "features/auth/routes/auth.logout.tsx");

						route(
							"/auth/impersonate",
							"features/auth/routes/auth.impersonate.tsx",
						);
						route(
							"/auth/impersonate/stop",
							"features/auth/routes/auth.impersonate.stop.tsx",
						);
					});
				},
			}),
			tsconfigPaths(),
		],
		test: {
			exclude: [...configDefaults.exclude, "e2e/**"],
		},
		build: {
			// this is mostly done so that i18n jsons as defined in ./app/modules/i18n/loader.ts
			// do not end up in the js bundle as minimized strings
			// if we decide later that this is a useful optimization in some cases then we can
			// switch the value to a callback one that checks the file path
			assetsInlineLimit: 0,
		},
	};
});
