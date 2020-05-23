import React, { useContext, useState } from "react"
import { Explanation } from "../../hooks/useAbilityEffects"
import MyThemeContext from "../../themeContext"
import { Ability, Build } from "../../types"
import { mainOnlyAbilities } from "../../utils/lists"
import {
  Progress,
  Box,
  Flex,
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@chakra-ui/core"
import AbilityIcon from "../builds/AbilityIcon"
import {
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Legend,
  Tooltip,
  Line,
  ResponsiveContainer,
} from "recharts"
import IconButton from "../elements/IconButton"
import { FaChartLine, FaInfo, FaQuestion } from "react-icons/fa"

interface BuildStatsProps {
  explanations: Explanation[]
  otherExplanations?: Explanation[]
  build: Partial<Build>
  hideExtra: boolean
}

const BuildStats: React.FC<BuildStatsProps> = ({
  explanations,
  otherExplanations,
  build,
  hideExtra,
}) => {
  const { colorMode, themeColorWithShade } = useContext(MyThemeContext)
  const abilityArrays: Ability[][] = [
    build.headgear ?? [],
    build.clothing ?? [],
    build.shoes ?? [],
  ]

  const abilityToPoints: Partial<Record<Ability, number>> = {}
  abilityArrays.forEach((arr) =>
    arr.forEach((ability, index) => {
      if (ability !== "UNKNOWN") {
        let abilityPoints = index === 0 ? 10 : 3
        if (mainOnlyAbilities.indexOf(ability as any) !== -1)
          abilityPoints = 999
        abilityToPoints[ability] = abilityToPoints.hasOwnProperty(ability)
          ? (abilityToPoints[ability] as any) + abilityPoints
          : abilityPoints
      }
    })
  )

  const BuildStat: React.FC<{
    title: string
    effect: string
    otherEffect?: string
    ability: Ability
    info?: string
    progressBarValue: number
    otherProgressBarValue?: number
    getEffect?: (ap: number) => number
  }> = ({
    title,
    effect,
    ability,
    otherEffect,
    otherProgressBarValue,
    getEffect,
    info,
    progressBarValue = 0,
  }) => {
    const [showChart, setShowChart] = useState(false)
    const { themeColorHex, darkerBgColor, themeColorWithShade } = useContext(
      MyThemeContext
    )

    const getData = () => {
      const toReturn = []
      for (let i = 0; i < 58; i++) {
        toReturn.push({ name: `${i}AP`, [title]: getEffect!(i) })
      }

      return toReturn
    }
    return (
      <>
        <Flex justifyContent="space-between">
          <Flex fontWeight="bold" mr="1em" mb="0.5em" alignItems="center">
            <Box mr="0.5em">
              <AbilityIcon ability={ability} size="TINY" />
            </Box>
            <IconButton
              icon={FaChartLine}
              onClick={() => setShowChart(!showChart)}
            />
            {title}
            {info && (
              <Popover trigger="hover" placement="top-start">
                <PopoverTrigger>
                  <Box>
                    <Box
                      color={themeColorWithShade}
                      ml="0.2em"
                      as={FaQuestion}
                      mb="0.2em"
                    />
                  </Box>
                </PopoverTrigger>
                <PopoverContent
                  zIndex={4}
                  p="0.5em"
                  bg={darkerBgColor}
                  border="0"
                >
                  {info}
                </PopoverContent>
              </Popover>
            )}
          </Flex>
          <Box
            fontWeight="bold"
            color={`orange.${colorMode === "dark" ? "200" : "500"}`}
            alignSelf="flex-end"
          >
            {effect}
          </Box>
        </Flex>
        <Progress
          color="orange"
          height={otherEffect ? "16px" : "32px"}
          value={progressBarValue}
          hasStripe
          isAnimated
        />
        {otherEffect && (
          <>
            <Progress
              color="blue"
              height="16px"
              value={otherProgressBarValue}
              hasStripe
              isAnimated
            />
            <Flex justifyContent="space-between">
              <Box />
              <Box
                fontWeight="bold"
                color={`blue.${colorMode === "dark" ? "200" : "500"}`}
                alignSelf="flex-end"
              >
                {otherEffect}
              </Box>
            </Flex>
          </>
        )}
        {getEffect && showChart && (
          <Box my="1em" ml="-26px">
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
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        )}
      </>
    )
  }

  /*const explanationsToUse = !hideExtra
    ? explanations
    : explanations.filter((e) => e.effectFromMax !== 0)*/

  return (
    <>
      {explanations.map((_explanation, index) => {
        const explanation = explanations[index]
        const otherExplanation = otherExplanations
          ? otherExplanations[index]
          : undefined

        if (
          explanation.effectFromMax === 0 &&
          (!otherExplanation || otherExplanation.effectFromMax === 0) &&
          hideExtra
        ) {
          return null
        }

        return (
          <Box my="1em" key={explanation.title}>
            <BuildStat
              title={explanation.title}
              ability={explanation.ability}
              effect={explanation.effect}
              progressBarValue={
                explanation.effectFromMaxActual ?? explanation.effectFromMax
              }
              otherEffect={otherExplanation?.effect}
              otherProgressBarValue={otherExplanation?.effectFromMax}
              getEffect={explanation.getEffect}
              info={explanation.info}
            />
          </Box>
        )
      })}
    </>
  )
}

export default BuildStats
