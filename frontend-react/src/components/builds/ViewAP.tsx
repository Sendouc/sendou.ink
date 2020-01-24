// This while is bit of a mess from TS PoV - might be worth while to do it better later

import React, { useContext } from "react"
import { Build, Ability } from "../../types"
import { Box, Flex } from "@chakra-ui/core"
import DividingBox from "../common/DividingBox"
import AbilityIcon from "./AbilityIcon"
import MyThemeContext from "../../themeContext"

const mainOnlyAbilities = [
  "CB",
  "LDE",
  "OG",
  "T",
  "H",
  "NS",
  "TI",
  "RP",
  "AD",
  "DR",
  "SJ",
  "OS",
] as const

interface ViewAPProps {
  build: Build
}

const ViewAP: React.FC<ViewAPProps> = ({ build }) => {
  const { grayWithShade } = useContext(MyThemeContext)
  const abilityArrays: Ability[][] = [
    build.headgear,
    build.clothing,
    build.shoes,
  ]

  const abilityToPoints: Partial<Record<Ability, number>> = {}
  abilityArrays.forEach(arr =>
    arr.forEach((ability, index) => {
      let abilityPoints = index === 0 ? 10 : 3
      if (mainOnlyAbilities.indexOf(ability as any) !== -1) abilityPoints = 999
      abilityToPoints[ability] = abilityToPoints.hasOwnProperty(ability)
        ? (abilityToPoints[ability] as any) + abilityPoints
        : abilityPoints
    })
  )

  const pointsToAbilities: Record<string, Ability[]> = {}
  ;(Object.keys(abilityToPoints) as Array<
    keyof typeof abilityToPoints
  >).forEach((ability: Ability) => {
    const points = abilityToPoints[ability]

    pointsToAbilities.hasOwnProperty(points as any)
      ? pointsToAbilities[points as any].push(ability)
      : (pointsToAbilities[points as any] = [ability])
  })

  const APArrays = (Object.keys(pointsToAbilities) as Array<
    keyof typeof pointsToAbilities
  >)
    .map(points => [points, pointsToAbilities[points as any]])
    .sort((a1, a2) => parseInt(a2[0] as string) - parseInt(a1[0] as string))

  let indexToPrintAPAt = APArrays[0][0] === "999" ? 1 : 0

  return (
    <Box mt="2">
      {APArrays.map((arr, index) => {
        return (
          <Flex
            key={arr[0] as any}
            justifyContent="flex-start"
            alignItems="center"
            gridRowGap="2em"
            mt={index === 0 ? "0" : "1em"}
          >
            {arr[0] !== "999" ? (
              <DividingBox location="right">
                <Box
                  color={grayWithShade}
                  width="32px"
                  minH="45px"
                  letterSpacing="wide"
                  fontSize="s"
                  fontWeight="semibold"
                  textAlign="center"
                  pt={indexToPrintAPAt !== index ? "10px" : undefined}
                >
                  {arr[0] as string}
                  {indexToPrintAPAt === index ? (
                    <>
                      <br />
                      AP
                    </>
                  ) : null}
                </Box>
              </DividingBox>
            ) : (
              <Box width="37px" />
            )}
            {(arr[1] as Array<Ability>).map((ability, abilityIndex) => (
              <Box
                width="45px"
                key={ability}
                ml={
                  abilityIndex !== 0 && arr[1].length > 5
                    ? `-${(arr[1].length - 5) * 5}px`
                    : undefined
                }
              >
                <AbilityIcon ability={ability} size="SUB" />
              </Box>
            ))}
          </Flex>
        )
      })}
    </Box>
  )
}

export default ViewAP
