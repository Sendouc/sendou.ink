import type { LinksFunction, LoaderArgs } from "@remix-run/node";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import { Main } from "~/components/Main";
import { findPlacements } from "../queries/findPlacements.server";
import styles from "../placements.css";
import { PlacementsTable } from "../components/Placements";
import { rankedModesShort } from "~/modules/in-game-lists/modes";
import type { SplatoonPlacement } from "~/db/types";
import type { RankedModeShort } from "~/modules/in-game-lists";
import { nanoid } from "nanoid";
import { useTranslation } from "~/hooks/useTranslation";
import invariant from "tiny-invariant";

export const loader = ({ request }: LoaderArgs) => {
  // #region parse URL params
  const url = new URL(request.url);
  // const type = (() => {
  //   const type = url.searchParams.get("type");
  //   if (type === "XRANK" || type === "SPLATFEST") {
  //     return type;
  //   }

  //   return "XRANK";
  // })();
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

    // TODO: return latest
    return 3;
  })();
  const year = (() => {
    const year = url.searchParams.get("year");
    if (year) {
      const yearNumber = Number(year);
      if (yearNumber >= 2023) {
        return yearNumber;
      }
    }

    // TODO: return latest
    return 2023;
  })();
  // #endregion

  const placements = findPlacements({
    type: "XRANK",
    mode,
    region,
    month,
    year,
  });

  return {
    placements,
  };
};

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
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

  // TODO: get latest month/year from API
  const selectValue = `${searchParams.get("month") ?? 3}-${
    searchParams.get("year") ?? 2023
  }-${searchParams.get("mode") ?? "SZ"}-${
    searchParams.get("region") ?? "WEST"
  }`;

  return (
    <Main halfWidth className="stack lg">
      <select
        className="text-sm"
        onChange={handleSelectChange}
        value={selectValue}
      >
        {selectOptions().map((option) => (
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
      </select>
      <PlacementsTable placements={data.placements} />
    </Main>
  );
}

type MonthYear = {
  month: number;
  year: number;
};
function selectOptions() {
  const options: Array<{
    id: string;
    region: SplatoonPlacement["region"];
    mode: RankedModeShort;
    span: {
      from: MonthYear;
      to: MonthYear;
      value: MonthYear;
    };
  }> = [];
  // TODO: splatfest
  // TODO: get month, year options from API
  for (const monthYear of [{ month: 3, year: 2023 }]) {
    for (const region of ["WEST", "JPN"] as const) {
      for (const mode of rankedModesShort) {
        options.push({
          id: nanoid(),
          region,
          mode,
          span: monthYearToSpan(monthYear),
        });
      }
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
