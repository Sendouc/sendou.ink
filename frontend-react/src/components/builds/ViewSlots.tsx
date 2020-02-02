import React from "react"
import { Build, Ability } from "../../types"
import AbilityIcon from "./AbilityIcon"
import Box from "../elements/Box"

interface ViewSlotsProps {
  build: Partial<Build>
}

const ViewSlots: React.FC<ViewSlotsProps> = ({ build }) => {
  return (
    <>
      <Box asFlex alignItems="center" justifyContent="center">
        {(
          build.headgear ??
          (["UNKNOWN", "UNKNOWN", "UNKNOWN", "UNKNOWN"] as Ability[])
        ).map((ability, index) => (
          <Box mx="3px" key={index}>
            <AbilityIcon
              key={index}
              ability={ability}
              size={index === 0 ? "MAIN" : "SUB"}
            />
          </Box>
        ))}
      </Box>
      <Box asFlex alignItems="center" justifyContent="center" my="0.5em">
        {(
          build.clothing ??
          (["UNKNOWN", "UNKNOWN", "UNKNOWN", "UNKNOWN"] as Ability[])
        ).map((ability, index) => (
          <Box mx="3px" key={index}>
            <AbilityIcon
              key={index}
              ability={ability}
              size={index === 0 ? "MAIN" : "SUB"}
            />
          </Box>
        ))}
      </Box>
      <Box asFlex alignItems="center" justifyContent="center">
        {(
          build.shoes ??
          (["UNKNOWN", "UNKNOWN", "UNKNOWN", "UNKNOWN"] as Ability[])
        ).map((ability, index) => (
          <Box mx="3px" key={index}>
            <AbilityIcon
              key={index}
              ability={ability}
              size={index === 0 ? "MAIN" : "SUB"}
            />
          </Box>
        ))}
      </Box>
    </>
  )
}

export default ViewSlots
