import {
  type LoaderArgs,
  type SerializeFrom,
  type V2_MetaFunction,
} from "@remix-run/node";
import {
  type ShouldRevalidateFunction,
  useLoaderData,
  useSearchParams,
} from "@remix-run/react";
import { cachified } from "cachified";
import clone from "just-clone";
import { nanoid } from "nanoid";
import * as React from "react";
import { BuildCard } from "~/components/BuildCard";
import { Button, LinkButton } from "~/components/Button";
import { Main } from "~/components/Main";
import { ChartBarIcon } from "~/components/icons/ChartBar";
import { CrossIcon } from "~/components/icons/Cross";
import { FilterIcon } from "~/components/icons/Filter";
import { FireIcon } from "~/components/icons/Fire";
import {
  BUILDS_PAGE_BATCH_SIZE,
  BUILDS_PAGE_MAX_BUILDS,
  ONE_HOUR_IN_MS,
} from "~/constants";
import { useTranslation } from "~/hooks/useTranslation";
import { i18next } from "~/modules/i18n";
import {
  abilities,
  weaponIdIsNotAlt,
  type Ability,
} from "~/modules/in-game-lists";
import { cache, ttl } from "~/utils/cache.server";
import { type SendouRouteHandle } from "~/utils/remix";
import { makeTitle } from "~/utils/strings";
import { weaponNameSlugToId } from "~/utils/unslugify.server";
import {
  BUILDS_PAGE,
  mySlugify,
  navIconUrl,
  outlinedMainWeaponImageUrl,
  weaponBuildPage,
} from "~/utils/urls";
import {
  type BuildFiltersFromSearchParams,
  buildFiltersSearchParams,
} from "../builds-schemas.server";
import type { BuildFilter } from "../builds-types";
import { buildsByWeaponId } from "../queries/buildsBy.server";
import { filterBuilds } from "../core/filter.server";
import { possibleApValues } from "~/features/build-analyzer";
import type { Unpacked } from "~/utils/types";
import { safeJSONParse } from "~/utils/json";

const FILTER_SEARCH_PARAM_KEY = "f";

const filterOutMeaninglessFilters = (
  filter: Unpacked<BuildFiltersFromSearchParams>
) =>
  filter.comparison !== "AT_LEAST" ||
  typeof filter.value !== "number" ||
  filter.value > 0;
export const shouldRevalidate: ShouldRevalidateFunction = (args) => {
  const rawOldFilters = args.currentUrl.searchParams.get(
    FILTER_SEARCH_PARAM_KEY
  );
  const oldFilters = rawOldFilters
    ? safeJSONParse<BuildFiltersFromSearchParams>(rawOldFilters, []).filter(
        filterOutMeaninglessFilters
      )
    : null;
  const rawNewFilters = args.nextUrl.searchParams.get(FILTER_SEARCH_PARAM_KEY);
  const newFilters = rawNewFilters
    ? // no safeJSONParse as the value should be coming from app code and should be trustworthy
      (JSON.parse(rawNewFilters) as BuildFiltersFromSearchParams).filter(
        filterOutMeaninglessFilters
      )
    : null;

  // meaningful filter was added/removed -> revalidate
  if (oldFilters && newFilters && oldFilters.length !== newFilters.length) {
    return true;
  }
  // no meaningful filters were or going to be in use -> skip revalidation
  if (
    oldFilters &&
    newFilters &&
    oldFilters.length === 0 &&
    newFilters.length === 0
  ) {
    return false;
  }
  // all meaningful filters identical -> skip revalidation
  if (
    newFilters?.every((f1) =>
      oldFilters?.some(
        (f2) =>
          f1.ability === f2.ability &&
          f1.comparison === f2.comparison &&
          f1.value === f2.value
      )
    )
  ) {
    return false;
  }

  return args.defaultShouldRevalidate;
};

export const meta: V2_MetaFunction = (args) => {
  const data = args.data as SerializeFrom<typeof loader> | null;

  if (!data) return [];

  return [{ title: data.title }];
};

export const handle: SendouRouteHandle = {
  i18n: ["weapons", "builds", "gear", "analyzer"],
  breadcrumb: ({ match }) => {
    const data = match.data as SerializeFrom<typeof loader> | undefined;

    if (!data) return [];

    return [
      {
        imgPath: navIconUrl("builds"),
        href: BUILDS_PAGE,
        type: "IMAGE",
      },
      {
        imgPath: outlinedMainWeaponImageUrl(data.weaponId),
        href: weaponBuildPage(data.slug),
        type: "IMAGE",
      },
    ];
  },
};

export const loader = async ({ request, params }: LoaderArgs) => {
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
    BUILDS_PAGE_MAX_BUILDS
  );

  const weaponName = t(`weapons:MAIN_${weaponId}`);

  const slug = mySlugify(t(`weapons:MAIN_${weaponId}`, { lng: "en" }));

  const cachedBuilds = await cachified({
    key: `builds-${weaponId}`,
    cache,
    ttl: ttl(ONE_HOUR_IN_MS),
    // eslint-disable-next-line @typescript-eslint/require-await
    async getFreshValue() {
      return buildsByWeaponId({
        weaponId,
        limit: BUILDS_PAGE_MAX_BUILDS,
      });
    },
  });

  const rawFilters = url.searchParams.get(FILTER_SEARCH_PARAM_KEY);
  const filters = buildFiltersSearchParams.safeParse(rawFilters ?? "[]");

  if (!filters.success) {
    console.error(
      "Invalid filters",
      JSON.stringify(filters.error.errors, null, 2)
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
  };
};

const BuildCards = React.memo(function BuildCards({
  data,
}: {
  data: SerializeFrom<typeof loader>;
}) {
  return (
    <div className="builds-container">
      {data.builds.map((build) => {
        return (
          <BuildCard
            key={build.id}
            build={build}
            owner={build}
            canEdit={false}
          />
        );
      })}
    </div>
  );
});

// xxx: max filter count + error message
// xxx: AND divider?
export default function WeaponsBuildsPage() {
  const data = useLoaderData<typeof loader>();
  const { t } = useTranslation(["common", "builds"]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = React.useState(() => {
    const rawFilters = searchParams.get(FILTER_SEARCH_PARAM_KEY);
    if (!rawFilters) return [];

    return safeJSONParse(rawFilters, []).map((f: any) => ({
      ...f,
      id: nanoid(),
    })) as BuildFilter[];
  });

  const syncSearchParams = (newFilters: BuildFilter[]) => {
    const filtersForSearchParams = newFilters.map((f) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...rest } = f;
      return rest;
    });

    setSearchParams(
      filtersForSearchParams.length > 0
        ? {
            [FILTER_SEARCH_PARAM_KEY]: JSON.stringify(filtersForSearchParams),
          }
        : {}
    );
  };

  const handleFilterAdd = () => {
    const newFilters = [
      ...filters,
      {
        id: nanoid(),
        ability: "ISM",
        comparison: "AT_LEAST",
        value: 0,
      } as const,
    ];
    setFilters(newFilters);

    // no need to sync as this doesn't have effect till they make other choices
  };

  const handleFilterChange = (i: number, newFilter: Partial<BuildFilter>) => {
    const newFilters = clone(filters);

    newFilters[i] = { ...filters[i], ...newFilter };

    setFilters(newFilters);

    syncSearchParams(newFilters);
  };

  const handleFilterDelete = (i: number) => {
    const newFilters = filters.filter((_, index) => index !== i);
    setFilters(newFilters);

    syncSearchParams(newFilters);
  };

  return (
    <Main className="stack lg">
      <div className="builds-buttons">
        <div>
          <Button
            variant="outlined"
            size="tiny"
            icon={<FilterIcon />}
            onClick={handleFilterAdd}
          >
            {t("builds:addFilter")}
          </Button>
        </div>
        <div className="builds-buttons__link">
          <LinkButton
            to="stats"
            variant="outlined"
            icon={<ChartBarIcon />}
            size="tiny"
          >
            {t("builds:linkButton.abilityStats")}
          </LinkButton>
          <LinkButton
            to="popular"
            variant="outlined"
            icon={<FireIcon />}
            size="tiny"
          >
            {t("builds:linkButton.popularBuilds")}
          </LinkButton>
        </div>
      </div>
      {filters.length > 0 ? (
        <div className="stack md">
          {filters.map((filter, i) => (
            <FilterSection
              key={filter.id}
              number={i + 1}
              filter={filter}
              onChange={(newFilter) => handleFilterChange(i, newFilter)}
              remove={() => handleFilterDelete(i)}
            />
          ))}
        </div>
      ) : null}
      <BuildCards data={data} />
      {data.limit < BUILDS_PAGE_MAX_BUILDS &&
        // not considering edge case where there are amount of builds equal to current limit
        // TODO: this could be fixed by taking example from the vods page
        data.builds.length === data.limit && (
          <LinkButton
            className="m-0-auto"
            size="tiny"
            to={`?limit=${data.limit + BUILDS_PAGE_BATCH_SIZE}`}
            state={{ scroll: false }}
          >
            {t("common:actions.loadMore")}
          </LinkButton>
        )}
    </Main>
  );
}

// xxx: implement ability select with real names and images (as combobox)
// xxx: mobile ui
// xxx: i18n
function FilterSection({
  number,
  filter,
  onChange,
  remove,
}: {
  number: number;
  filter: BuildFilter;
  onChange: (filter: Partial<BuildFilter>) => void;
  remove: () => void;
}) {
  const { t } = useTranslation(["analyzer"]);

  const abilityObject = abilities.find((a) => a.name === filter.ability)!;

  return (
    <section>
      <div className="stack horizontal justify-between mx-2">
        <div className="text-xs font-bold">Filter {number}</div>
        <div>
          <Button
            icon={<CrossIcon />}
            size="tiny"
            variant="minimal-destructive"
            onClick={remove}
            aria-label="Delete filter"
          />
        </div>
      </div>
      <div className="build__filter">
        <select
          value={filter.ability}
          onChange={(e) =>
            onChange({
              ability: e.target.value as Ability,
              value:
                abilities.find((a) => a.name === e.target.value)!.type ===
                "STACKABLE"
                  ? 0
                  : true,
            })
          }
        >
          {abilities.map((ability) => {
            return (
              <option key={ability.name} value={ability.name}>
                {ability.name}
              </option>
            );
          })}
        </select>
        {abilityObject.type !== "STACKABLE" ? (
          <select
            value={!filter.value ? "false" : "true"}
            onChange={(e) =>
              onChange({ value: e.target.value === "true" ? true : false })
            }
          >
            <option value="true">Has</option>
            <option value="false">Doesn&apos;t have</option>
          </select>
        ) : null}
        {abilityObject.type === "STACKABLE" ? (
          <select
            onChange={(e) =>
              onChange({
                comparison: e.target.value as BuildFilter["comparison"],
              })
            }
          >
            <option value="AT_LEAST">At least</option>
            <option value="AT_MOST">At most</option>
          </select>
        ) : null}
        {abilityObject.type === "STACKABLE" ? (
          <div className="stack horizontal sm items-center">
            <select
              onChange={(e) => onChange({ value: Number(e.target.value) })}
              value={typeof filter.value === "number" ? filter.value : "0"}
              className="build__filter__ap-select"
            >
              {possibleApValues().map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
            <div className="text-sm">{t("analyzer:abilityPoints.short")}</div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
