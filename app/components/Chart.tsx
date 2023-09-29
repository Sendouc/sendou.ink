import clsx from "clsx";
import * as React from "react";
import { type AxisOptions, Chart as ReactChart } from "react-charts";
import type { TooltipRendererProps } from "react-charts/types/components/TooltipRenderer";
import { useIsMounted } from "~/hooks/useIsMounted";
import { Theme, useTheme } from "~/modules/theme";

export default function Chart({
  options,
  containerClassName,
  headerSuffix,
  valueSuffix,
}: {
  options: [
    { label: string; data: Array<{ primary: Date; secondary: number }> },
  ];
  containerClassName?: string;
  headerSuffix?: string;
  valueSuffix?: string;
}) {
  const theme = useTheme();
  const isMounted = useIsMounted();

  const primaryAxis = React.useMemo<
    AxisOptions<(typeof options)[number]["data"][number]>
  >(
    () => ({
      getValue: (datum) => datum.primary,
    }),
    [],
  );

  const secondaryAxes = React.useMemo<
    AxisOptions<(typeof options)[number]["data"][number]>[]
  >(
    () => [
      {
        getValue: (datum) => datum.secondary,
      },
    ],
    [],
  );

  if (!isMounted) {
    return <div className={clsx("chart__container", containerClassName)} />;
  }

  return (
    <div className={clsx("chart__container", containerClassName)}>
      <ReactChart
        options={{
          data: options,
          tooltip: {
            render: (props) => (
              <ChartTooltip
                {...props}
                headerSuffix={headerSuffix}
                valueSuffix={valueSuffix}
              />
            ),
          },
          primaryAxis,
          secondaryAxes,
          dark: theme.htmlThemeClass === Theme.DARK,
          defaultColors: ["var(--theme)", "var(--theme-secondary)"],
        }}
      />
    </div>
  );
}

interface ChartTooltipProps extends TooltipRendererProps<any> {
  headerSuffix?: string;
  valueSuffix?: string;
}

// xxx: date header for tooltip
function ChartTooltip({
  focusedDatum,
  headerSuffix = "",
  valueSuffix = "",
}: ChartTooltipProps) {
  const dataPoints = focusedDatum?.interactiveGroup ?? [];

  return (
    <div className="chart__tooltip">
      <h3 className="text-center text-md">
        {dataPoints[0]?.primaryValue}
        {headerSuffix}
      </h3>
      {dataPoints.map((dataPoint, index) => {
        const color = dataPoint.style?.fill ?? "var(--theme)";

        return (
          <div key={index} className="stack horizontal items-center sm">
            <div
              className="chart__dot"
              style={{ "--dot-color": color } as any}
            />
            <div className="chart__tooltip__label">
              {dataPoint.originalSeries.label}
            </div>
            <div className="chart__tooltip__value">
              {dataPoint.secondaryValue}
              {valueSuffix}
            </div>
          </div>
        );
      })}
    </div>
  );
}
