import React from "react"

import { abilitiesGameOrder } from "../../assets/imageImports"
import AbilityIcon from "../common/AbilityIcon"
import { Divider } from "semantic-ui-react"

const headOnly = ["CB", "LDE", "OG", "T"]
const clothingOnly = ["H", "NS", "TI", "RP"]
const shoesOnly = ["DR", "SJ", "OS"]

const AbilityButton = ({ abilities, setAbilities }) => {
  const handleClick = abilityName => {
    let copyOfArray = [...abilities]
    if (headOnly.includes(abilityName)) {
      if (abilities[0][0] === "") {
        copyOfArray[0][0] = abilityName
      }
    } else if (clothingOnly.includes(abilityName)) {
      if (abilities[1][0] === "") {
        copyOfArray[1][0] = abilityName
      }
    } else if (shoesOnly.includes(abilityName)) {
      if (abilities[2][0] === "") {
        copyOfArray[2][0] = abilityName
      }
    } else {
      for (let i = 0; i < abilities.length; i++) {
        for (let j = 0; j < abilities[i].length; j++) {
          const element = abilities[i][j]
          if (element === "") {
            copyOfArray[i][j] = abilityName
            setAbilities(copyOfArray)
            return
          }
        }
      }
    }
    setAbilities(copyOfArray)
  }

  return (
    <>
      {abilitiesGameOrder.map(ability => (
        <React.Fragment key={ability}>
          {ability === "OG" && <Divider />}
          <AbilityIcon
            style={{ margin: "0 0.2em 0 0.2em", cursor: "pointer" }}
            ability={ability}
            onClick={() => handleClick(ability)}
          />
        </React.Fragment>
      ))}
    </>
  )
}

export default AbilityButton
