import React from "react"
import { Build, Ability } from "../../types"
import AbilityIcon from "./AbilityIcon"
import { Flex, Box } from "@chakra-ui/core"

interface ViewSlotsProps {
  build: Partial<Build>
  onAbilityClick?: (gear: "HEAD" | "CLOTHING" | "SHOES", index: number) => void
}

const ViewSlots: React.FC<ViewSlotsProps> = ({ build, onAbilityClick }) => {
  return (
    <>
      <Flex alignItems="center" justifyContent="center">
        {(
          build.headgear ??
          (["UNKNOWN", "UNKNOWN", "UNKNOWN", "UNKNOWN"] as Ability[])
        ).map((ability, index) => (
          <Box
            mx="3px"
            key={index}
            onClick={
              onAbilityClick ? () => onAbilityClick("HEAD", index) : undefined
            }
            cursor={onAbilityClick ? "pointer" : undefined}
          >
            <AbilityIcon
              key={index}
              ability={ability}
              size={index === 0 ? "MAIN" : "SUB"}
            />
          </Box>
        ))}
      </Flex>
      <Flex alignItems="center" justifyContent="center" my="0.5em">
        {(
          build.clothing ??
          (["UNKNOWN", "UNKNOWN", "UNKNOWN", "UNKNOWN"] as Ability[])
        ).map((ability, index) => (
          <Box
            mx="3px"
            key={index}
            onClick={
              onAbilityClick
                ? () => onAbilityClick("CLOTHING", index)
                : undefined
            }
            cursor={onAbilityClick ? "pointer" : undefined}
          >
            <AbilityIcon
              key={index}
              ability={ability}
              size={index === 0 ? "MAIN" : "SUB"}
            />
          </Box>
        ))}
      </Flex>
      <Flex alignItems="center" justifyContent="center">
        {(
          build.shoes ??
          (["UNKNOWN", "UNKNOWN", "UNKNOWN", "UNKNOWN"] as Ability[])
        ).map((ability, index) => (
          <Box
            mx="3px"
            key={index}
            onClick={
              onAbilityClick ? () => onAbilityClick("SHOES", index) : undefined
            }
            cursor={onAbilityClick ? "pointer" : undefined}
          >
            <AbilityIcon
              key={index}
              ability={ability}
              size={index === 0 ? "MAIN" : "SUB"}
            />
          </Box>
        ))}
      </Flex>
    </>
  )
}

export default ViewSlots
