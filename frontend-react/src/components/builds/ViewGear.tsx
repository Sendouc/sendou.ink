import React from "react"
import { Grid } from "@chakra-ui/core"
import GearImage from "./GearImage"
import { Build } from "../../types"
import AbilityIcon from "./AbilityIcon"
import Box from "../elements/Box"

interface ViewGearProps {
  build: Build
}

const MARGINX = "3px"

const ViewGear: React.FC<ViewGearProps> = ({ build }) => {
  return (
    <>
      <Box asFlex alignItems="center" justifyContent="center">
        {build.headgear.map((ability, index) => (
          <Box mx={MARGINX} key={index}>
            <AbilityIcon
              key={index}
              ability={ability}
              size={index === 0 ? "MAIN" : "SUB"}
            />
          </Box>
        ))}
      </Box>
      <Box asFlex alignItems="center" justifyContent="center" my="0.5em">
        {build.clothing.map((ability, index) => (
          <Box mx={MARGINX} key={index}>
            <AbilityIcon
              key={index}
              ability={ability}
              size={index === 0 ? "MAIN" : "SUB"}
            />
          </Box>
        ))}
      </Box>
      <Box asFlex alignItems="center" justifyContent="center">
        {build.shoes.map((ability, index) => (
          <Box mx={MARGINX} key={index}>
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

export default ViewGear
