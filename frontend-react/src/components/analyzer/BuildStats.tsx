import {
  Box,
  Flex,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Progress,
} from "@chakra-ui/core"
import React, { useContext, useState } from "react"
import { FaChartLine, FaQuestion } from "react-icons/fa"
import { Explanation } from "../../hooks/useAbilityEffects"
import MyThemeContext from "../../themeContext"
import { Ability, Build } from "../../types"
import { mainOnlyAbilities } from "../../utils/lists"
import AbilityIcon from "../builds/AbilityIcon"
import IconButton from "../elements/IconButton"
import StatChart from "./StatChart"

interface BuildStatsProps {
  explanations: Explanation[]
  otherExplanations?: Explanation[]
  build: Partial<Build>
  hideExtra: boolean
  showNotActualProgress: boolean
  startChartsAtZero: boolean
}

const BuildStats: React.FC<BuildStatsProps> = ({
  explanations,
  otherExplanations,
  build,
  hideExtra,
  showNotActualProgress,
  startChartsAtZero,
}) => {
  const { colorMode } = useContext(MyThemeContext)
  const [expandedCharts, setExpandedCharts] = useState<Set<string>>(new Set())

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
    ap: number
    otherAp?: number
    chartExpanded: boolean
    toggleChart: () => void
  }> = ({
    title,
    effect,
    ability,
    otherEffect,
    otherProgressBarValue,
    getEffect,
    info,
    ap,
    otherAp,
    chartExpanded,
    toggleChart,
    progressBarValue = 0,
  }) => {
    const { darkerBgColor, themeColorWithShade } = useContext(MyThemeContext)

    return (
      <>
        <Flex justifyContent="space-between">
          <Flex fontWeight="bold" mr="1em" mb="0.5em" alignItems="center">
            <Box mr="0.5em">
              <AbilityIcon ability={ability} size="TINY" />
            </Box>
            <IconButton icon={FaChartLine} onClick={() => toggleChart()} />
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
        {getEffect && chartExpanded && (
          <Box my="1em" ml="-26px">
            <StatChart
              title={title}
              ap={ap}
              otherAp={otherAp}
              getEffect={getEffect}
              ability={ability}
              startChartsAtZero={startChartsAtZero}
            />
          </Box>
        )}
      </>
    )
  }

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
                showNotActualProgress
                  ? explanation.effectFromMax
                  : explanation.effectFromMaxActual
              }
              otherEffect={otherExplanation?.effect}
              otherProgressBarValue={
                showNotActualProgress
                  ? otherExplanation?.effectFromMax
                  : otherExplanation?.effectFromMaxActual
              }
              getEffect={explanation.getEffect}
              info={explanation.info}
              ap={explanation.ap}
              otherAp={otherExplanation?.ap}
              chartExpanded={expandedCharts.has(explanation.title)}
              toggleChart={() => {
                const newSet = new Set(expandedCharts)
                if (newSet.has(explanation.title)) {
                  newSet.delete(explanation.title)
                } else {
                  newSet.add(explanation.title)
                }

                setExpandedCharts(newSet)
              }}
            />
          </Box>
        )
      })}
    </>
  )
}

export default BuildStats
