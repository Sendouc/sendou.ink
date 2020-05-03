import React from "react"
import AbilityButtons from "../user/AbilityButtons"
import ViewSlots from "../builds/ViewSlots"
import { Box } from "@chakra-ui/core"
import {
  Build,
  Ability,
  HeadOnlyAbility,
  ClothingOnlyAbility,
  ShoesOnlyAbility,
  StackableAbility,
} from "../../types"
import {
  headOnlyAbilities,
  clothingOnlyAbilities,
  shoesOnlyAbilities,
} from "../../utils/lists"

interface EditableBuildProps {
  build: Partial<Build>
  setBuild: React.Dispatch<React.SetStateAction<Partial<Build>>>
}

const EditableBuild: React.FC<EditableBuildProps> = ({ build, setBuild }) => {
  const handleChange = (value: Object) => setBuild({ ...build, ...value })

  const handleAbilityButtonClick = (ability: Ability) => {
    if (headOnlyAbilities.indexOf(ability as any) !== -1) {
      if (build.headgear![0] === "UNKNOWN") {
        handleChange({
          headgear: [
            ability,
            build.headgear![1],
            build.headgear![2],
            build.headgear![3],
          ],
        })
      }
    } else if (clothingOnlyAbilities.indexOf(ability as any) !== -1) {
      if (build.clothing![0] === "UNKNOWN") {
        handleChange({
          clothing: [
            ability,
            build.clothing![1],
            build.clothing![2],
            build.clothing![3],
          ],
        })
      }
    } else if (shoesOnlyAbilities.indexOf(ability as any) !== -1) {
      if (build.shoes![0] === "UNKNOWN") {
        handleChange({
          shoes: [ability, build.shoes![1], build.shoes![2], build.shoes![3]],
        })
      }
    } else {
      const headI = build.headgear!.indexOf("UNKNOWN")
      if (headI !== -1) {
        const copy = build.headgear!.slice()
        copy[headI] = ability as HeadOnlyAbility | StackableAbility
        handleChange({
          headgear: copy,
        })
        return
      }

      const clothingI = build.clothing!.indexOf("UNKNOWN")
      if (clothingI !== -1) {
        const copy = build.clothing!.slice()
        copy[clothingI] = ability as ClothingOnlyAbility | StackableAbility
        handleChange({
          clothing: copy,
        })
        return
      }

      const shoesI = build.shoes!.indexOf("UNKNOWN")
      if (shoesI !== -1) {
        const copy = build.shoes!.slice()
        copy[shoesI] = ability as ShoesOnlyAbility | StackableAbility
        handleChange({
          shoes: copy,
        })
      }
    }
  }

  const handleClickBuildAbility = (
    slot: "HEAD" | "CLOTHING" | "SHOES",
    index: number
  ) => {
    if (slot === "HEAD") {
      const copy = build.headgear!.slice()
      copy[index] = "UNKNOWN"
      handleChange({
        headgear: copy,
      })
    } else if (slot === "CLOTHING") {
      const copy = build.clothing!.slice()
      copy[index] = "UNKNOWN"
      handleChange({
        clothing: copy,
      })
    } else {
      const copy = build.shoes!.slice()
      copy[index] = "UNKNOWN"
      handleChange({
        shoes: copy,
      })
    }
  }
  return (
    <>
      <Box mt="1em">
        <ViewSlots build={build} onAbilityClick={handleClickBuildAbility} />
      </Box>
      <Box mt="1em">
        <AbilityButtons
          onClick={(ability) => handleAbilityButtonClick(ability)}
        />
      </Box>
    </>
  )
}

export default EditableBuild
