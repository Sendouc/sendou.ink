import React, { useState } from "react"
import Modal from "../elements/Modal"
import WeaponSelector from "../common/WeaponSelector"
import {
  Weapon,
  Build,
  HeadGear,
  ClothingGear,
  ShoesGear,
  Ability,
  HeadOnlyAbility,
  ClothingOnlyAbility,
  ShoesOnlyAbility,
  StackableAbility,
} from "../../types"
import WeaponImage from "../common/WeaponImage"
import Select from "../elements/Select"
import {
  headSelectOptions,
  clothingSelectOptions,
  shoesSelectOptions,
  headOnlyAbilities,
  clothingOnlyAbilities,
  shoesOnlyAbilities,
  headGear,
} from "../../utils/lists"
import Box from "../elements/Box"
import GearImage from "../builds/GearImage"
import Input from "../elements/Input"
import ViewSlots from "../builds/ViewSlots"
import AbilityButtons from "./AbilityButtons"

interface BuildFormModalProps {
  existingGear: ExistingGearObject
}

type ExistingGearObject = Record<
  Partial<HeadGear | ClothingGear | ShoesGear>,
  Ability[]
>

const BuildFormModal: React.FC<BuildFormModalProps> = ({ existingGear }) => {
  const [build, setBuild] = useState<Partial<Build>>({
    headgear: ["UNKNOWN", "UNKNOWN", "UNKNOWN", "UNKNOWN"],
    clothing: ["UNKNOWN", "UNKNOWN", "UNKNOWN", "UNKNOWN"],
    shoes: ["UNKNOWN", "UNKNOWN", "UNKNOWN", "UNKNOWN"],
  })

  const handleChange = (value: Object) => setBuild({ ...build, ...value })

  const handleAbilityClick = (ability: Ability) => {
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

  return (
    <Modal title="Adding a new build">
      <WeaponSelector
        required
        label="Weapon"
        setValue={(weapon: Weapon) => handleChange({ weapon })}
      />
      {build.weapon && (
        <WeaponImage englishName={build.weapon as Weapon} size="MEDIUM" />
      )}
      <Box asFlex mt="1em" justifyContent="space-between" flexWrap="wrap">
        <Box asFlex flexDirection="column" alignItems="center">
          <Select
            label="Headgear"
            options={headSelectOptions}
            clearable
            setValue={(headgearItem: HeadGear) => {
              if (
                (!build.headgear ||
                  build.headgear.every(ability => ability === "UNKNOWN")) &&
                existingGear.hasOwnProperty(headgearItem)
              ) {
                handleChange({
                  headgearItem,
                  headgear: existingGear[headgearItem],
                })
              } else {
                handleChange({ headgearItem })
              }
            }}
          />
          {build.headgearItem && (
            <Box mt="0.5em">
              <GearImage englishName={build.headgearItem} />
            </Box>
          )}
        </Box>
        <Box asFlex flexDirection="column" alignItems="center">
          <Select
            label="Clothing"
            options={clothingSelectOptions}
            clearable
            setValue={(clothingItem: ClothingGear) => {
              if (
                (!build.clothing ||
                  build.clothing.every(ability => ability === "UNKNOWN")) &&
                existingGear.hasOwnProperty(clothingItem)
              ) {
                handleChange({
                  clothingItem,
                  clothing: existingGear[clothingItem],
                })
              } else {
                handleChange({ clothingItem })
              }
            }}
          />
          {build.clothingItem && (
            <Box mt="0.5em">
              <GearImage englishName={build.clothingItem} />
            </Box>
          )}
        </Box>
        <Box asFlex flexDirection="column" alignItems="center">
          <Select
            label="Shoes"
            options={shoesSelectOptions}
            clearable
            setValue={(shoesItem: ShoesGear) => {
              if (
                (!build.shoes ||
                  build.shoes.every(ability => ability === "UNKNOWN")) &&
                existingGear.hasOwnProperty(shoesItem)
              ) {
                handleChange({
                  shoesItem,
                  shoes: existingGear[shoesItem],
                })
              } else {
                handleChange({ shoesItem })
              }
            }}
          />
          {build.shoesItem && (
            <Box mt="0.5em">
              <GearImage englishName={build.shoesItem} />
            </Box>
          )}
        </Box>
      </Box>
      <Box mt="1em">
        <Input
          value={build.title}
          setValue={(value: string) => handleChange({ title: value })}
          placeholder="Title"
          label="Title"
          limit={100}
        />
      </Box>
      <Box mt="1em">
        <ViewSlots build={build} />
      </Box>
      <Box mt="1em">
        <AbilityButtons onClick={ability => handleAbilityClick(ability)} />
      </Box>
    </Modal>
  )
}

export default BuildFormModal
