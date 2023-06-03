import {
  type LoaderArgs,
  type SerializeFrom,
  type V2_MetaFunction,
} from "@remix-run/node";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import { cachified } from "cachified";
import clone from "just-clone";
import { nanoid } from "nanoid";
import * as React from "react";
import { useDebounce } from "react-use";
import { z } from "zod";
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
import { db } from "~/db";
import { useTranslation } from "~/hooks/useTranslation";
import { i18next } from "~/modules/i18n";
import { Ability } from "~/modules/in-game-lists";
import { abilities, weaponIdIsNotAlt } from "~/modules/in-game-lists";
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
import { safeJSONParse } from "~/utils/zod";

const buildFilterSchema = z.object({
  ability: z.string(), // xxx: narrow down
  value: z.union([z.number(), z.boolean()]),
  comparison: z.enum(["AT_LEAST", "AT_MOST"]),
});
const buildFiltersSearchParams = z.preprocess(
  safeJSONParse,
  z.union([z.null(), z.array(buildFilterSchema)])
);
interface BuildFilter {
  id: string;
  ability: Ability;
  /** Ability points value or "has"/"doesn't have" */
  value?: number | boolean;
  comparison: "AT_LEAST" | "AT_MOST";
}

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
      return db.builds.buildsByWeaponId({
        weaponId,
        limit: BUILDS_PAGE_MAX_BUILDS,
      });
    },
  });

  const rawFilters = url.searchParams.get("f");
  console.log("rawFilters", rawFilters);
  const filters = buildFiltersSearchParams.safeParse(rawFilters ?? "[]");
  console.log({ filters });

  if (!filters.success) {
    console.error(
      "Invalid filters",
      JSON.stringify(filters.error.errors, null, 2)
    );
  }

  return {
    weaponId,
    weaponName,
    title: makeTitle([weaponName, t("common:pages.builds")]),
    builds: cachedBuilds.slice(0, limit),
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
export default function WeaponsBuildsPage() {
  const data = useLoaderData<typeof loader>();
  const { t } = useTranslation(["common", "builds"]);
  const [filters, setFilters] = React.useState<BuildFilter[]>([]);
  useDebounce(
    () => {
      const filtersForSearchParams = filters.map((f) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...rest } = f;
        return rest;
      });

      setSearchParams(
        filtersForSearchParams.length > 0
          ? { f: JSON.stringify(filtersForSearchParams) }
          : {}
      );
    },
    1500,
    [filters]
  );
  const [, setSearchParams] = useSearchParams();

  const handleFilterAdd = () => {
    setFilters((prev) => [
      ...prev,
      {
        id: nanoid(),
        ability: "ISM",
        comparison: "AT_LEAST",
        value: 0,
      },
    ]);
  };

  const handleFilterChange = (i: number, newFilter: Partial<BuildFilter>) => {
    const newFilters = clone(filters);

    newFilters[i] = { ...filters[i], ...newFilter };

    setFilters(newFilters);
  };

  const handleFilterDelete = (i: number) => {
    setFilters((f) => f.filter((_, index) => index !== i));
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
          onChange={(e) => onChange({ ability: e.target.value as Ability })}
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
            <input
              className="build__filter__ap-input"
              id="ap"
              type="number"
              name="ap"
              min={0}
              max={57}
              onChange={(e) => onChange({ value: Number(e.target.value) })}
              value={
                typeof filter.value === "number" ? filter.value : undefined
              }
            />
            <div className="text-sm">{t("analyzer:abilityPoints.short")}</div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
