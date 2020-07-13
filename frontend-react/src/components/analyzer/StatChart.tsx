import React, { useContext } from "react"
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import MyThemeContext from "../../themeContext"
import { possibleAps } from "../../utils/lists"
import { useTranslation } from "react-i18next"

interface StatChartProps {
  title: string
  getEffect: (ap: number) => number
  ap: number
  otherAp?: number
  startChartsAtZero: boolean
}

const StatChart: React.FC<StatChartProps> = ({
  title,
  ap,
  otherAp,
  getEffect,
  startChartsAtZero,
}) => {
  const { t } = useTranslation()
  const { themeColorHex, darkerBgColor } = useContext(MyThemeContext)

  const getData = () =>
    possibleAps.map((ap) => ({ name: `${ap}AP`, [title]: getEffect(ap) }))

  const CustomizedDot = (props: any) => {
    const { cx, cy, payload } = props

    if (payload.name === `${ap}${t("analyzer;abilityPointShort")}`) {
      return (
        <svg
          x={cx - 5}
          y={cy - 5}
          width={100}
          height={100}
          fill="red"
          viewBox="0 0 1024 1024"
        >
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke="white"
            strokeWidth="18"
            fill="#DD6B20"
          />
        </svg>
      )
    }

    if (payload.name === `${otherAp}${t("analyzer;abilityPointShort")}`) {
      return (
        <svg
          x={cx - 5}
          y={cy - 5}
          width={100}
          height={100}
          fill="red"
          viewBox="0 0 1024 1024"
        >
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke="white"
            strokeWidth="18"
            fill="#3182CE"
          />
        </svg>
      )
    }

    return null
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={getData()}>
        <CartesianGrid strokeDasharray="3 3" color="#000" />
        <XAxis dataKey="name" />
        <YAxis
          domain={startChartsAtZero ? undefined : ["dataMin", "dataMax"]}
        />
        <Tooltip
          contentStyle={{
            background: darkerBgColor,
            borderRadius: "5px",
            border: 0,
          }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey={title}
          stroke={themeColorHex}
          dot={<CustomizedDot />}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

export default StatChart
