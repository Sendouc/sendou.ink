import { type LoaderFunctionArgs } from "@remix-run/node";
import { BUILDS_PAGE_BATCH_SIZE, BUILDS_PAGE_MAX_BUILDS } from "~/constants";
import { i18next } from "~/modules/i18n/i18next.server";
import { weaponIdIsNotAlt } from "~/modules/in-game-lists";
import { makeTitle } from "~/utils/strings";
import { weaponNameSlugToId } from "~/utils/unslugify.server";
import { mySlugify } from "~/utils/urls";
import { buildFiltersSearchParams } from "../builds-schemas.server";
import { cachedBuildsByWeaponId } from "../core/cached-builds.server";
import { filterBuilds } from "../core/filter.server";
import { FILTER_SEARCH_PARAM_KEY } from "../builds-constants";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const t = await i18next.getFixedT(request, ["weapons", "common"], {
    lng: "en",
  });
  const weaponId = weaponNameSlugToId(params["slug"]);

  if (typeof weaponId !== "number" || !weaponIdIsNotAlt(weaponId)) {
    throw new Response(null, { status: 404 });
  }

  const url = new URL(request.url);
  const limit = Math.min(
    Number(url.searchParams.get("limit") ?? BUILDS_PAGE_BATCH_SIZE),
    BUILDS_PAGE_MAX_BUILDS,
  );

  const weaponName = t(`weapons:MAIN_${weaponId}`);

  const slug = mySlugify(t(`weapons:MAIN_${weaponId}`, { lng: "en" }));

  const cachedBuilds = cachedBuildsByWeaponId(weaponId);

  const rawFilters = url.searchParams.get(FILTER_SEARCH_PARAM_KEY);
  const filters = buildFiltersSearchParams.safeParse(rawFilters ?? "[]");

  if (!filters.success) {
    console.error(
      "Invalid filters",
      JSON.stringify(filters.error.errors, null, 2),
    );
  }

  const filteredBuilds =
    filters.success && filters.data && filters.data.length > 0
      ? filterBuilds({
          builds: cachedBuilds,
          filters: filters.data,
          count: limit,
        })
      : cachedBuilds.slice(0, limit);

  return {
    weaponId,
    weaponName,
    title: makeTitle([weaponName, t("common:pages.builds")]),
    builds: filteredBuilds,
    limit,
    slug,
    filters: filters.success ? filters.data : [],
  };
};
