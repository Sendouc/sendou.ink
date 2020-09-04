import React from "react"
import AbilityButtons from "../user/AbilityButtons"
import ViewSlots from "../builds/ViewSlots"
import { Box, Flex } from "@chakra-ui/core"
import {
  Ability,
  HeadOnlyAbility,
  ClothingOnlyAbility,
  ShoesOnlyAbility,
  StackableAbility,
  AnalyzerBuild,
} from "../../types"
import {
  headOnlyAbilities,
  clothingOnlyAbilities,
  shoesOnlyAbilities,
} from "../../utils/lists"
import Button from "../elements/Button"
import { FaPlus, FaMinus } from "react-icons/fa"
import HeadOnlyToggle from "./HeadOnlyToggle"
import LdeSlider from "./LdeSlider"
import { useTranslation } from "react-i18next"

interface EditableBuildsProps {
  build: Omit<AnalyzerBuild, "weapon">
  otherBuild: Omit<AnalyzerBuild, "weapon">
  setBuild: React.Dispatch<React.SetStateAction<Omit<AnalyzerBuild, "weapon">>>
  showOther: boolean
  setShowOther: React.Dispatch<React.SetStateAction<boolean>>
  otherFocused: boolean
  changeFocus: () => void
  bonusAp: Partial<Record<Ability, boolean>>
  setBonusAp: React.Dispatch<
    React.SetStateAction<Partial<Record<Ability, boolean>>>
  >
  otherBonusAp: Partial<Record<Ability, boolean>>
  setOtherBonusAp: React.Dispatch<
    React.SetStateAction<Partial<Record<Ability, boolean>>>
  >
  lde: number
  otherLde: number
  setLde: React.Dispatch<React.SetStateAction<number>>
  setOtherLde: React.Dispatch<React.SetStateAction<number>>
}

const EditableBuilds: React.FC<EditableBuildsProps> = ({
  build,
  otherBuild,
  setBuild,
  showOther,
  setShowOther,
  otherFocused,
  changeFocus,
  bonusAp,
  setBonusAp,
  otherBonusAp,
  setOtherBonusAp,
  lde,
  otherLde,
  setLde,
  setOtherLde,
}) => {
  const { t } = useTranslation()
  const buildToEdit = otherFocused ? otherBuild : build
  const handleChange = (value: Object) => setBuild({ ...buildToEdit, ...value })

  const handleAbilityButtonClick = (ability: Ability) => {
    if (headOnlyAbilities.indexOf(ability as any) !== -1) {
      if (buildToEdit.headgear![0] === "UNKNOWN") {
        handleChange({
          headgear: [
            ability,
            buildToEdit.headgear![1],
            buildToEdit.headgear![2],
            buildToEdit.headgear![3],
          ],
        })
      }
    } else if (clothingOnlyAbilities.indexOf(ability as any) !== -1) {
      if (buildToEdit.clothing![0] === "UNKNOWN") {
        handleChange({
          clothing: [
            ability,
            buildToEdit.clothing![1],
            buildToEdit.clothing![2],
            buildToEdit.clothing![3],
          ],
        })
      }
    } else if (shoesOnlyAbilities.indexOf(ability as any) !== -1) {
      if (buildToEdit.shoes![0] === "UNKNOWN") {
        handleChange({
          shoes: [
            ability,
            buildToEdit.shoes![1],
            buildToEdit.shoes![2],
            buildToEdit.shoes![3],
          ],
        })
      }
    } else {
      const headI = buildToEdit.headgear!.indexOf("UNKNOWN")
      if (headI !== -1) {
        const copy = buildToEdit.headgear!.slice()
        copy[headI] = ability as HeadOnlyAbility | StackableAbility
        handleChange({
          headgear: copy,
        })
        return
      }

      const clothingI = buildToEdit.clothing!.indexOf("UNKNOWN")
      if (clothingI !== -1) {
        const copy = buildToEdit.clothing!.slice()
        copy[clothingI] = ability as ClothingOnlyAbility | StackableAbility
        handleChange({
          clothing: copy,
        })
        return
      }

      const shoesI = buildToEdit.shoes!.indexOf("UNKNOWN")
      if (shoesI !== -1) {
        const copy = buildToEdit.shoes!.slice()
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
      const copy = buildToEdit.headgear!.slice()
      copy[index] = "UNKNOWN"
      handleChange({
        headgear: copy,
      })
    } else if (slot === "CLOTHING") {
      const copy = buildToEdit.clothing!.slice()
      copy[index] = "UNKNOWN"
      handleChange({
        clothing: copy,
      })
    } else {
      const copy = buildToEdit.shoes!.slice()
      copy[index] = "UNKNOWN"
      handleChange({
        shoes: copy,
      })
    }
  }

  const headAbility = build.headgear ? build.headgear[0] : "SSU"
  const otherHeadAbility = otherBuild.headgear ? otherBuild.headgear[0] : "SSU"

  return (
    <>
      <Button
        icon={showOther ? FaMinus : FaPlus}
        onClick={() => {
          if (showOther && otherFocused) {
            changeFocus()
          }
          setShowOther(!showOther)
        }}
        mt="1em"
        mb="2em"
      >
        {showOther ? t("analyzer;Stop comparing") : t("analyzer;Compare")}
      </Button>
      <Flex justifyContent="space-evenly" flexWrap="wrap" mb="1em">
        <Flex flexDirection="column">
          {showOther && (
            <Button
              disabled={!otherFocused}
              color="orange"
              onClick={() => changeFocus()}
            >
              {!otherFocused ? t("analyzer;Editing") : t("calendar;Edit")}
            </Button>
          )}
          <ViewSlots
            build={build}
            onAbilityClick={!otherFocused ? handleClickBuildAbility : undefined}
            m="1em"
            cursor={!otherFocused ? undefined : "not-allowed"}
          />
          {["OG", "CB"].includes(headAbility) && (
            <HeadOnlyToggle
              ability={headAbility as any}
              active={bonusAp[headAbility] ?? false}
              setActive={() =>
                setBonusAp({
                  ...bonusAp,
                  [headAbility]: !bonusAp[headAbility],
                })
              }
            />
          )}
          {headAbility === "LDE" && (
            <LdeSlider
              value={lde}
              setValue={(value: number) => setLde(value)}
            />
          )}
        </Flex>
        {showOther && (
          <Flex flexDirection="column">
            <Button
              disabled={otherFocused}
              color="blue"
              onClick={() => changeFocus()}
            >
              {otherFocused ? "Editing" : "Edit"}
            </Button>
            <ViewSlots
              build={otherBuild}
              onAbilityClick={
                otherFocused ? handleClickBuildAbility : undefined
              }
              m="1em"
              cursor={otherFocused ? undefined : "not-allowed"}
            />
            {["OG", "CB"].includes(otherHeadAbility) && (
              <HeadOnlyToggle
                ability={otherHeadAbility as any}
                active={otherBonusAp[otherHeadAbility] ?? false}
                setActive={() =>
                  setOtherBonusAp({
                    ...otherBonusAp,
                    [otherHeadAbility]: !otherBonusAp[otherHeadAbility],
                  })
                }
              />
            )}
            {otherHeadAbility === "LDE" && (
              <LdeSlider
                value={otherLde}
                setValue={(value: number) => setOtherLde(value)}
              />
            )}
          </Flex>
        )}
      </Flex>
      <Box mt="1em">
        <AbilityButtons
          onClick={(ability) => handleAbilityButtonClick(ability)}
        />
      </Box>
    </>
  )
}

export default EditableBuilds
