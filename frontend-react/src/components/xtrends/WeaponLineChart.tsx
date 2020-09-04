import React, { useContext } from "react"
import { LineChart, Line, Tooltip } from "recharts"
import MyThemeContext from "../../themeContext"
import { months } from "../../utils/lists"
import { Box, Flex, Badge } from "@chakra-ui/core"
import { useTranslation } from "react-i18next"
import { parseAndGetLocalizedMonthYear } from "../../utils/helperFunctions"

interface WeaponLineChartProps {
  counts: {
    year: number
    SZ: (null | number)[]
    TC: (null | number)[]
    RM: (null | number)[]
    CB: (null | number)[]
  }[]
  mode: "SZ" | "TC" | "RM" | "CB"
  lastMonthYear: string
}

interface CustomTooltipProps {
  active?: any
  payload?: any
  label?: any
}

const WeaponLineChart: React.FC<WeaponLineChartProps> = ({
  counts,
  mode,
  lastMonthYear,
}) => {
  const { themeColor, themeColorHex, darkerBgColor } = useContext(
    MyThemeContext
  )

  const lastMonthYearParts = lastMonthYear.split(" ")
  const lastMonthIndex = months.indexOf(lastMonthYearParts[0] as any)
  const lastYear = parseInt(lastMonthYearParts[1])

  const getChartData = () => {
    const countsPutTogether = counts.reduce((acc: number[], cur) => {
      // in 2018 first X Rank month was May
      if (cur.year === 2018) return [...acc, ...cur[mode].slice(5)] as number[]

      // in the ongoing year let's not include months that didn't happen yet
      if (cur.year === lastYear)
        return [...acc, ...cur[mode].slice(1, lastMonthIndex + 1)] as number[]

      return [...acc, ...cur[mode].slice(1)] as number[]
    }, [])

    let nextMonth = counts[0].year === 2018 ? 4 : 0
    let nextYear = counts[0].year

    return countsPutTogether.reduce(
      (acc: { name: string; "Top 500 results": number }[], cur) => {
        nextMonth++
        if (nextMonth === 13) {
          nextMonth = 1
          nextYear++
        }
        return [
          ...acc,
          { name: `${months[nextMonth]} ${nextYear}`, "Top 500 results": cur },
        ]
      },
      []
    )
  }

  const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
    const { i18n } = useTranslation()
    if (active) {
      return (
        <Flex
          bg={darkerBgColor}
          flexDir="column"
          alignItems="center"
          padding="0.5em"
          borderRadius="5px"
          border="1px solid"
        >
          <Box fontWeight="bolder" fontSize="1.1em">
            {parseAndGetLocalizedMonthYear(
              payload[0].payload.name,
              i18n.language
            )}
          </Box>
          <Box fontWeight="bold">
            <Badge variantColor={themeColor} mr="0.5em">
              {payload[0].payload["Top 500 results"]}
            </Badge>
          </Box>
        </Flex>
      )
    }

    return null
  }

  return (
    <LineChart width={300} height={100} data={getChartData()}>
      <Line
        type="monotone"
        dataKey="Top 500 results"
        stroke={themeColorHex}
        strokeWidth={2}
      />
      <Tooltip content={<CustomTooltip />} />
    </LineChart>
  )
}

export default WeaponLineChart
