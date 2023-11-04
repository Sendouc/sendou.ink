import type {
  LinksFunction,
  LoaderFunctionArgs,
  MetaFunction,
  SerializeFrom,
} from "@remix-run/node";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import { Main } from "~/components/Main";
import { findPlacementsOfMonth } from "../queries/findPlacements.server";
import styles from "../top-search.css";
import { PlacementsTable } from "../components/Placements";
import { rankedModesShort } from "~/modules/in-game-lists/modes";
import type { XRankPlacement } from "~/db/types";
import type { RankedModeShort } from "~/modules/in-game-lists";
import { nanoid } from "nanoid";
import { useTranslation } from "~/hooks/useTranslation";
import invariant from "tiny-invariant";
import type { MonthYear } from "../top-search-utils";
import { i18next } from "~/modules/i18n";
import { makeTitle } from "~/utils/strings";
import { monthYears } from "../queries/monthYears";
import type { SendouRouteHandle } from "~/utils/remix";
import { navIconUrl, topSearchPage } from "~/utils/urls";

export const handle: SendouRouteHandle = {
  breadcrumb: () => ({
    imgPath: navIconUrl("xsearch"),
    href: topSearchPage(),
    type: "IMAGE",
  }),
};

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export const meta: MetaFunction = (args) => {
  const data = args.data as SerializeFrom<typeof loader> | null;

  if (!data) return [];

  return [
    { title: data.title },
    { name: "description", content: "Splatoon 3 X Battle results" },
  ];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const availableMonthYears = monthYears();
  const { month: latestMonth, year: latestYear } = availableMonthYears[0]!;

  // #region parse URL params
  const url = new URL(request.url);
  const mode = (() => {
    const mode = url.searchParams.get("mode");
    if (rankedModesShort.includes(mode as any)) {
      return mode as RankedModeShort;
    }

    return "SZ";
  })();
  const region = (() => {
    const region = url.searchParams.get("region");
    if (region === "WEST" || region === "JPN") {
      return region;
    }

    return "WEST";
  })();
  const month = (() => {
    const month = url.searchParams.get("month");
    if (month) {
      const monthNumber = Number(month);
      if (monthNumber >= 1 && monthNumber <= 12) {
        return monthNumber;
      }
    }

    return latestMonth;
  })();
  const year = (() => {
    const year = url.searchParams.get("year");
    if (year) {
      const yearNumber = Number(year);
      if (yearNumber >= 2023) {
        return yearNumber;
      }
    }

    return latestYear;
  })();
  // #endregion

  const placements = findPlacementsOfMonth({
    mode,
    region,
    month,
    year,
  });

  const t = await i18next.getFixedT(request);

  return {
    title: makeTitle(t("pages.xsearch")),
    placements,
    availableMonthYears,
  };
};

export default function XSearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useTranslation(["common", "game-misc"]);
  const data = useLoaderData<typeof loader>();

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const [month, year, mode, region] = event.target.value.split("-");
    invariant(month, "month is missing");
    invariant(year, "year is missing");
    invariant(mode, "mode is missing");
    invariant(region, "region is missing");

    setSearchParams({
      month,
      year,
      mode,
      region,
    });
  };

  const selectValue = `${
    searchParams.get("month") ?? data.availableMonthYears[0]!.month
  }-${searchParams.get("year") ?? data.availableMonthYears[0]!.year}-${
    searchParams.get("mode") ?? "SZ"
  }-${searchParams.get("region") ?? "WEST"}`;

  return (
    <Main halfWidth className="stack lg">
      <select
        className="text-sm"
        onChange={handleSelectChange}
        value={selectValue}
        data-testid="xsearch-select"
      >
        {selectOptions(data.availableMonthYears).map((group) => (
          <optgroup
            key={group[0]!.id}
            label={t(`common:divisions.${group[0]!.region}`)}
          >
            {group.map((option) => (
              <option
                key={option.id}
                value={`${option.span.value.month}-${option.span.value.year}-${option.mode}-${option.region}`}
              >
                {option.span.from.month}/{option.span.from.year} -{" "}
                {option.span.to.month}/{option.span.to.year} /{" "}
                {t(`game-misc:MODE_SHORT_${option.mode}`)} /{" "}
                {t(`common:divisions.${option.region}`)}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      <PlacementsTable placements={data.placements} />
    </Main>
  );
}

interface SelectOption {
  id: string;
  region: XRankPlacement["region"];
  mode: RankedModeShort;
  span: {
    from: MonthYear;
    to: MonthYear;
    value: MonthYear;
  };
}

function selectOptions(monthYears: MonthYear[]) {
  const options: SelectOption[][] = [];
  for (const monthYear of monthYears) {
    for (const region of ["WEST", "JPN"] as const) {
      const regionOptions: SelectOption[] = [];
      for (const mode of rankedModesShort) {
        regionOptions.push({
          id: nanoid(),
          region,
          mode,
          span: monthYearToSpan(monthYear),
        });
      }

      options.push(regionOptions);
    }
  }

  return options;
}

function monthYearToSpan(monthYear: MonthYear) {
  const date = new Date(monthYear.year, monthYear.month - 1);
  const lastMonth = new Date(date.getFullYear(), date.getMonth(), 0);
  const threeMonthsAgo = new Date(date.getFullYear(), date.getMonth() - 3, 1);

  return {
    from: {
      month: threeMonthsAgo.getMonth() + 1,
      year: threeMonthsAgo.getFullYear(),
    },
    to: {
      month: lastMonth.getMonth() + 1,
      year: lastMonth.getFullYear(),
    },
    value: {
      month: date.getMonth() + 1,
      year: date.getFullYear(),
    },
  };
}
