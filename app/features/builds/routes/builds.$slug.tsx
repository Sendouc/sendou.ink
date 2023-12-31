import { cachified } from "@epic-web/cachified";
import {
  type LoaderFunctionArgs,
  type MetaFunction,
  type SerializeFrom,
} from "@remix-run/node";
import {
  useLoaderData,
  useSearchParams,
  type ShouldRevalidateFunction,
} from "@remix-run/react";
import clone from "just-clone";
import { nanoid } from "nanoid";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { Ability } from "~/components/Ability";
import { BuildCard } from "~/components/BuildCard";
import { Button, LinkButton } from "~/components/Button";
import { Main } from "~/components/Main";
import { Menu } from "~/components/Menu";
import { BeakerFilledIcon } from "~/components/icons/BeakerFilled";
import { CalendarIcon } from "~/components/icons/Calendar";
import { ChartBarIcon } from "~/components/icons/ChartBar";
import { CrossIcon } from "~/components/icons/Cross";
import { FilterIcon } from "~/components/icons/Filter";
import { FireIcon } from "~/components/icons/Fire";
import { MapIcon } from "~/components/icons/Map";
import {
  BUILDS_PAGE_BATCH_SIZE,
  BUILDS_PAGE_MAX_BUILDS,
  ONE_HOUR_IN_MS,
} from "~/constants";
import { possibleApValues } from "~/features/build-analyzer";
import { i18next } from "~/modules/i18n";
import type { ModeShort } from "~/modules/in-game-lists";
import {
  abilities,
  weaponIdIsNotAlt,
  type Ability as AbilityType,
  modesShort,
} from "~/modules/in-game-lists";
import { cache, ttl } from "~/utils/cache.server";
import { safeJSONParse } from "~/utils/json";
import { type SendouRouteHandle } from "~/utils/remix";
import { makeTitle } from "~/utils/strings";
import type { Unpacked } from "~/utils/types";
import { weaponNameSlugToId } from "~/utils/unslugify.server";
import {
  BUILDS_PAGE,
  mySlugify,
  navIconUrl,
  outlinedMainWeaponImageUrl,
  weaponBuildPage,
} from "~/utils/urls";
import { MAX_BUILD_FILTERS } from "../builds-constants";
import {
  buildFiltersSearchParams,
  type BuildFiltersFromSearchParams,
} from "../builds-schemas.server";
import type {
  AbilityBuildFilter,
  BuildFilter,
  ModeBuildFilter,
} from "../builds-types";
import { filterBuilds } from "../core/filter.server";
import { buildsByWeaponId } from "../queries/buildsBy.server";
import { ModeImage } from "~/components/Image";

const FILTER_SEARCH_PARAM_KEY = "f";

const filterOutMeaninglessFilters = (
  filter: Unpacked<BuildFiltersFromSearchParams>,
) =>
  // @ts-expect-error xxx: fix
  filter.comparison !== "AT_LEAST" ||
  // @ts-expect-error xxx: fix
  typeof filter.value !== "number" ||
  // @ts-expect-error xxx: fix
  filter.value > 0;
export const shouldRevalidate: ShouldRevalidateFunction = (args) => {
  const oldLimit = args.currentUrl.searchParams.get("limit");
  const newLimit = args.nextUrl.searchParams.get("limit");

  // limit was changed -> revalidate
  if (oldLimit !== newLimit) {
    return true;
  }

  const rawOldFilters = args.currentUrl.searchParams.get(
    FILTER_SEARCH_PARAM_KEY,
  );
  const oldFilters = rawOldFilters
    ? safeJSONParse<BuildFiltersFromSearchParams>(rawOldFilters, []).filter(
        filterOutMeaninglessFilters,
      )
    : null;
  const rawNewFilters = args.nextUrl.searchParams.get(FILTER_SEARCH_PARAM_KEY);
  const newFilters = rawNewFilters
    ? // no safeJSONParse as the value should be coming from app code and should be trustworthy
      (JSON.parse(rawNewFilters) as BuildFiltersFromSearchParams).filter(
        filterOutMeaninglessFilters,
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
    newFilters?.every(
      (f1) =>
        oldFilters?.some(
          (f2) =>
            // @ts-expect-error xxx: fix
            f1.ability === f2.ability &&
            // @ts-expect-error xxx: fix
            f1.comparison === f2.comparison &&
            // @ts-expect-error xxx: fix
            f1.value === f2.value,
        ),
    )
  ) {
    return false;
  }

  return args.defaultShouldRevalidate;
};

export const meta: MetaFunction = (args) => {
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

export default function WeaponsBuildsPage() {
  const data = useLoaderData<typeof loader>();
  const { t } = useTranslation(["common", "builds"]);
  const [, setSearchParams] = useSearchParams();
  const [filters, setFilters] = React.useState<BuildFilter[]>(
    data.filters ? data.filters.map((f) => ({ ...f, id: nanoid() })) : [],
  );

  const filtersForSearchParams = (filters: BuildFilter[]) =>
    JSON.stringify(
      filters.map((f) => {
        const { id, ...rest } = f;
        return rest;
      }),
    );
  const syncSearchParams = (newFilters: BuildFilter[]) => {
    setSearchParams(
      filtersForSearchParams.length > 0
        ? {
            [FILTER_SEARCH_PARAM_KEY]: filtersForSearchParams(newFilters),
          }
        : {},
    );
  };

  const handleFilterAdd = (type: BuildFilter["type"]) => {
    const newFilter: BuildFilter =
      type === "ability"
        ? {
            id: nanoid(),
            type: "ability",
            ability: "ISM",
            comparison: "AT_LEAST",
            value: 0,
          }
        : type === "date"
          ? {
              id: nanoid(),
              type: "date",
              date: new Date().getTime(),
            }
          : {
              id: nanoid(),
              type: "mode",
              mode: "SZ",
            };

    const newFilters = [...filters, newFilter];
    setFilters(newFilters);

    // no need to sync as this doesn't have effect till they make other choices
  };

  const handleFilterChange = (i: number, newFilter: Partial<BuildFilter>) => {
    const newFilters = clone(filters);

    newFilters[i] = {
      ...(filters[i] as AbilityBuildFilter),
      ...(newFilter as AbilityBuildFilter),
    };

    setFilters(newFilters);

    syncSearchParams(newFilters);
  };

  const handleFilterDelete = (i: number) => {
    const newFilters = filters.filter((_, index) => index !== i);
    setFilters(newFilters);

    syncSearchParams(newFilters);
  };

  const loadMoreLink = () => {
    const params = new URLSearchParams();

    params.set("limit", String(data.limit + BUILDS_PAGE_BATCH_SIZE));

    if (filters.length > 0) {
      params.set(FILTER_SEARCH_PARAM_KEY, filtersForSearchParams(filters));
    }

    return `?${params.toString()}`;
  };

  const FilterMenuButton = React.forwardRef(function (props, ref) {
    return (
      <Button
        variant="outlined"
        size="tiny"
        icon={<FilterIcon />}
        disabled={filters.length >= MAX_BUILD_FILTERS}
        testId="add-filter-button"
        {...props}
        _ref={ref}
      >
        {t("builds:addFilter")}
      </Button>
    );
  });

  return (
    <Main className="stack lg">
      <div className="builds-buttons">
        <Menu
          items={[
            {
              text: "By ability",
              icon: <BeakerFilledIcon />,
              onClick: () => handleFilterAdd("ability"),
            },
            {
              text: "By mode",
              icon: <MapIcon />,
              onClick: () => handleFilterAdd("mode"),
            },
            {
              text: "By date",
              icon: <CalendarIcon />,
              onClick: () => handleFilterAdd("date"),
            },
          ]}
          button={FilterMenuButton}
        />
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
            to={loadMoreLink()}
            state={{ scroll: false }}
          >
            {t("common:actions.loadMore")}
          </LinkButton>
        )}
    </Main>
  );
}

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
  const { t } = useTranslation(["builds"]);

  return (
    <section>
      <div className="stack horizontal justify-between mx-2">
        <div className="text-xs font-bold">
          {t("builds:filters.title", { number })}
        </div>
        <div>
          <Button
            icon={<CrossIcon />}
            size="tiny"
            variant="minimal-destructive"
            onClick={remove}
            aria-label="Delete filter"
            testId="delete-filter-button"
          />
        </div>
      </div>
      {filter.type === "ability" ? (
        <AbilityFilter filter={filter} onChange={onChange} />
      ) : null}
      {filter.type === "mode" ? (
        <ModeFilter filter={filter} onChange={onChange} number={number} />
      ) : null}
    </section>
  );
}

function AbilityFilter({
  filter,
  onChange,
}: {
  filter: AbilityBuildFilter;
  onChange: (filter: Partial<BuildFilter>) => void;
}) {
  const { t } = useTranslation(["analyzer", "game-misc", "builds"]);
  const abilityObject = abilities.find((a) => a.name === filter.ability)!;

  return (
    <div className="build__filter">
      <div className="build__filter__ability">
        <Ability ability={filter.ability} size="TINY" />
      </div>
      <select
        value={filter.ability}
        onChange={(e) =>
          onChange({
            ability: e.target.value as AbilityType,
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
              {t(`game-misc:ABILITY_${ability.name}`)}
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
          <option value="true">{t("builds:filters.has")}</option>
          <option value="false">{t("builds:filters.does.not.have")}</option>
        </select>
      ) : null}
      {abilityObject.type === "STACKABLE" ? (
        <select
          value={filter.comparison}
          onChange={(e) =>
            onChange({
              comparison: e.target.value as AbilityBuildFilter["comparison"],
            })
          }
          data-testid="comparison-select"
        >
          <option value="AT_LEAST">{t("builds:filters.atLeast")}</option>
          <option value="AT_MOST">{t("builds:filters.atMost")}</option>
        </select>
      ) : null}
      {abilityObject.type === "STACKABLE" ? (
        <div className="stack horizontal sm items-center">
          <select
            className="build__filter__ap-select"
            value={typeof filter.value === "number" ? filter.value : "0"}
            onChange={(e) => onChange({ value: Number(e.target.value) })}
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
  );
}

function ModeFilter({
  filter,
  onChange,
  number,
}: {
  filter: ModeBuildFilter;
  onChange: (filter: Partial<BuildFilter>) => void;
  number: number;
}) {
  const { t } = useTranslation(["analyzer", "game-misc", "builds"]);

  const inputId = (mode: ModeShort) => `${number}-${mode}`;

  return (
    <div className="build__filter build__filter__mode">
      {modesShort.map((mode) => {
        return (
          <div
            key={mode}
            className="stack horizontal xs items-center font-sm font-semi-bold"
          >
            <input
              type="radio"
              name={`mode-${number}`}
              id={inputId(mode)}
              value={mode}
              checked={filter.mode === mode}
              onChange={() => onChange({ mode })}
            />
            <label htmlFor={inputId(mode)} className="stack horizontal xs mb-0">
              <ModeImage mode={mode} size={18} />
              {t(`game-misc:MODE_LONG_${mode}`)}
            </label>
          </div>
        );
      })}
    </div>
  );
}
