import React from "react"
import { abilitiesGameOrder } from "../../utils/lists"
import AbilityIcon from "../builds/AbilityIcon"
import Box from "../elements/Box"
import Label from "../elements/Label"
import { Ability } from "../../types"

interface AbilityButtonsProps {
  onClick: (ability: Ability) => void
}

const AbilityButtons: React.FC<AbilityButtonsProps> = ({ onClick }) => {
  return (
    <>
      <Box my="1em" textAlign="center">
        <Label>Main abilities (click to select)</Label>
      </Box>
      <Box
        asFlex
        flexWrap="wrap"
        justifyContent="center"
        maxW="340px"
        mx="auto"
      >
        {abilitiesGameOrder
          .slice(14, abilitiesGameOrder.length)
          .map(ability => (
            <Box
              m="0.3em"
              key={ability}
              cursor="pointer"
              onClick={() => onClick(ability)}
            >
              <AbilityIcon ability={ability} size="SUB" />
            </Box>
          ))}
      </Box>
      <Box my="1em" textAlign="center">
        <Label>Sub abilities</Label>
      </Box>
      <Box
        asFlex
        flexWrap="wrap"
        justifyContent="center"
        maxW="350px"
        mx="auto"
      >
        {abilitiesGameOrder.slice(0, 14).map(ability => (
          <Box
            m="0.3em"
            key={ability}
            cursor="pointer"
            onClick={() => onClick(ability)}
          >
            {ability === "OG" && <br />}
            <AbilityIcon ability={ability} size="SUB" />
          </Box>
        ))}
      </Box>
    </>
  )
}

export default AbilityButtons
