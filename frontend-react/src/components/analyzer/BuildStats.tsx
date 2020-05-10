import React, { useContext } from "react"
import { Explanation } from "../../hooks/useAbilityEffects"
import MyThemeContext from "../../themeContext"
import { Ability, Build } from "../../types"
import { mainOnlyAbilities } from "../../utils/lists"
import { Progress, Box, Flex } from "@chakra-ui/core"

interface APWithInfoProps {
  explanations: Explanation[]
  build: Partial<Build>
}

const BuildStats: React.FC<APWithInfoProps> = ({ explanations, build }) => {
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
    progressBarValue: number
  }> = ({ title, effect, progressBarValue = 0 }) => {
    return (
      <>
        <Flex justifyContent="space-between">
          <Box fontWeight="bold" mr="1em">
            {title}
          </Box>
          <Box fontWeight="bold" color={themeColorWithShade}>
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

  return (
    <>
      {explanations.map((explanation) => (
        <Box my="1em">
          <BuildStat
            title={explanation.title}
            effect={explanation.effect}
            progressBarValue={explanation.effectFromMax}
          />
        </Box>
      ))}
    </>
  )
}

export default BuildStats
