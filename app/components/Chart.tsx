import React from "react";
import { type AxisOptions, Chart as ReactChart } from "react-charts";
import { useIsMounted } from "~/hooks/useIsMounted";
import { Theme, useTheme } from "~/modules/theme";

export default function Chart({
  options,
}: {
  options: [
    { label: string; data: Array<{ primary: Date; secondary: number }> }
  ];
}) {
  const theme = useTheme();
  const isMounted = useIsMounted();

  const primaryAxis = React.useMemo<
    AxisOptions<(typeof options)[number]["data"][number]>
  >(
    () => ({
      getValue: (datum) => datum.primary,
    }),
    []
  );

  const secondaryAxes = React.useMemo<
    AxisOptions<(typeof options)[number]["data"][number]>[]
  >(
    () => [
      {
        getValue: (datum) => datum.secondary,
      },
    ],
    []
  );

  if (!isMounted)
    return (
      <div
        style={{
          height: "175px",
          backgroundColor: "var(--bg-lighter)",
          borderRadius: "var(--rounded)",
        }}
      />
    );

  return (
    <div
      style={{
        height: "175px",
        backgroundColor: "var(--bg-lighter)",
        borderRadius: "var(--rounded)",
        color: "white",
      }}
    >
      <ReactChart
        options={{
          data: options,
          primaryAxis,
          secondaryAxes,
          dark: theme.htmlThemeClass === Theme.DARK,
          defaultColors: ["var(--theme)"],
        }}
      />
    </div>
  );
}
