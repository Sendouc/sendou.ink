import React, { useContext } from "react"
import { Explanation } from "../../hooks/useAbilityEffects"
import MyThemeContext from "../../themeContext"
import { Ability, Build } from "../../types"
import { mainOnlyAbilities } from "../../utils/lists"
import { Progress, Box, Flex } from "@chakra-ui/core"
import AbilityIcon from "../builds/AbilityIcon"

interface BuildStatsProps {
  explanations: Explanation[]
  build: Partial<Build>
  hideExtra: boolean
}

const BuildStats: React.FC<BuildStatsProps> = ({
  explanations,
  build,
  hideExtra,
}) => {
  const { themeColor, themeColorWithShade } = useContext(MyThemeContext)
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
    title: String
    effect: string
    ability: Ability
    progressBarValue: number
  }> = ({ title, effect, ability, progressBarValue = 0 }) => {
    return (
      <>
        <Flex justifyContent="space-between">
          <Flex fontWeight="bold" mr="1em" mb="0.5em" alignItems="center">
            <Box mr="0.5em">
              <AbilityIcon ability={ability} size="TINY" />
            </Box>
            {title}
          </Flex>
          <Box
            fontWeight="bold"
            color={themeColorWithShade}
            alignSelf="flex-end"
          >
            {effect}
          </Box>
        </Flex>
        <Progress
          color={themeColor}
          height="32px"
          value={progressBarValue}
          hasStripe
          isAnimated
        />
      </>
    )
  }

  const explanationsToUse = !hideExtra
    ? explanations
    : explanations.filter((e) => e.effectFromMax !== 0)

  return (
    <>
      {explanationsToUse.map((explanation) => (
        <Box my="1em" key={explanation.title}>
          <BuildStat
            title={explanation.title}
            effect={explanation.effect}
            ability={explanation.ability}
            progressBarValue={explanation.effectFromMax}
          />
        </Box>
      ))}
    </>
  )
}

export default BuildStats
