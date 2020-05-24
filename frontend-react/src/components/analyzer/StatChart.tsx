import React, { useContext } from "react"
import {
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line,
} from "recharts"
import MyThemeContext from "../../themeContext"

interface StatChartProps {
  title: string
  getEffect: (ap: number) => number
  ap: number
  otherAp?: number
}

const StatChart: React.FC<StatChartProps> = ({
  title,
  ap,
  otherAp,
  getEffect,
}) => {
  const { themeColorHex, darkerBgColor } = useContext(MyThemeContext)

  const getData = () => {
    const toReturn = []
    for (let i = 0; i < 58; i++) {
      toReturn.push({ name: `${i}AP`, [title]: getEffect(i) })
    }

    return toReturn
  }

  const CustomizedDot = (props: any) => {
    const { cx, cy, payload } = props

    if (payload.name === `${ap}AP`) {
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

    if (payload.name === `${otherAp}AP`) {
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
        <YAxis />
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
