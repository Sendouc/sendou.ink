import { RankedMode } from "@prisma/client";
import { getMonthOptions } from "pages/xsearch/[[...slug]]";
import { GetXTrendsData } from "prisma/queries/getXTrends";
import { Dispatch, useMemo, useReducer } from "react";

interface XTrendsState {
  mode: RankedMode;
  month: number;
  year: number;
}

type Action =
  | {
      type: "SET_MODE";
      mode: RankedMode;
    }
  | {
      type: "SET_MONTH_YEAR";
      month: number;
      year: number;
    };

export type XTrendsDispatch = Dispatch<Action>;

export function useXTrends(trends: GetXTrendsData) {
  const [state, dispatch] = useReducer(
    (oldState: XTrendsState, action: Action) => {
      switch (action.type) {
        case "SET_MODE":
          return { ...oldState, mode: action.mode };
        case "SET_MONTH_YEAR":
          return { ...oldState, month: action.month, year: action.year };
        default:
          return oldState;
      }
    },
    {
      month: 11,
      year: 2020,
      mode: "SZ",
    }
  );

  const weapons = trends[state.year][state.month];

  const monthOptions = useMemo(() => {
    const latestYear = Math.max(
      ...Object.keys(trends).map((year) => parseInt(year))
    );
    const latestMonth = Math.max(
      ...Object.keys(trends[latestYear]).map((month) => parseInt(month))
    );
    return getMonthOptions(latestMonth, latestYear);
  }, []);

  const weaponData = Object.entries(weapons)
    .reduce(
      (
        acc: { name: string; count: number; xPowerAverage: number }[],
        [weapon, modes]
      ) => {
        const weaponInfo = modes[state.mode];
        if (!weaponInfo) return acc;

        acc.push({
          name: weapon,
          count: weaponInfo.count,
          xPowerAverage: weaponInfo.xPowerAverage,
        });

        return acc;
      },
      []
    )
    .sort((a, b) => {
      if (a.count !== b.count) return b.count - a.count;

      return b.xPowerAverage - a.xPowerAverage;
    });

  function getDataForChart(weapon: string) {
    const counts = monthOptions.map((monthYear) => {
      return {
        count:
          trends[monthYear.year][monthYear.month][weapon]?.[state.mode]
            ?.count ?? 0,
      };
    });

    counts.reverse();
    return counts;
  }

  return {
    state,
    dispatch,
    weaponData,
    getDataForChart,
    monthOptions,
  };
}
