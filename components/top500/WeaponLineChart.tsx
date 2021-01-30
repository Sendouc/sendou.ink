import { useMyTheme } from "hooks/common";
import { Line, LineChart } from "recharts";

interface WeaponLineChartProps {
  getDataForChart: () => { count: number }[];
}

const WeaponLineChart: React.FC<WeaponLineChartProps> = ({
  getDataForChart,
}) => {
  const { themeColorHex } = useMyTheme();

  return (
    <LineChart width={300} height={100} data={getDataForChart()}>
      <Line
        type="monotone"
        dataKey="count"
        stroke={themeColorHex}
        strokeWidth={2}
        dot={false}
      />
    </LineChart>
  );
};

export default WeaponLineChart;
