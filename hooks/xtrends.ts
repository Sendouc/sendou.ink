import { GetXTrendsData } from "prisma/queries/getXTrends";
import { Dispatch, useReducer } from "react";

interface XTrendsState {
  mode: "SZ" | "TC" | "RM" | "CB";
  month: number;
  year: number;
}

type Action =
  | {
      type: "SET_MODE";
      mode: "SZ" | "TC" | "RM" | "CB";
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
    return Object.entries(trends)
      .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
      .reduce((acc: { count: number }[], [year, monthsObject]) => {
        let month = 1;
        while (month < 13) {
          if (monthsObject[month]?.[weapon]?.[state.mode]) {
            acc.push({
              count: monthsObject[month]![weapon]![state.mode]!.count,
            });
          }
          month++;
        }
        return acc;
      }, []);
  }

  return {
    state,
    dispatch,
    weaponData,
    getDataForChart,
  };
}
