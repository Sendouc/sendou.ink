import React, { useContext } from "react"
import { Explanation } from "../../hooks/useAbilityEffects"
import MyThemeContext from "../../themeContext"
import { Ability, Build } from "../../types"
import { abilitiesGameOrder, mainOnlyAbilities } from "../../utils/lists"
//import { mainOnlyAbilities } from "../../utils/lists"

interface APWithInfoProps {
  explanations: Explanation[]
  build: Partial<Build>
}

const APWithInfo: React.FC<APWithInfoProps> = ({ explanations, build }) => {
  const { grayWithShade } = useContext(MyThemeContext)
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

  const APArrays = (Object.keys(abilityToPoints) as Array<
    keyof typeof abilityToPoints
  >)
    .map((ability) => [ability, abilityToPoints[ability]])
    .sort((a1, a2) => {
      const compare = parseInt(a2[1] as string) - parseInt(a1[1] as string)
      if (compare !== 0) return compare

      return (
        abilitiesGameOrder.indexOf(a2[0] as any) -
        abilitiesGameOrder.indexOf(a1[0] as any)
      )
    })

  console.log("APArrays", APArrays)

  return <></>
}

export default APWithInfo
