import React from "react"
import useAbilityEffects from "../../hooks/useAbilityEffects"
import { Build } from "../../types"
import BuildStats from "../analyzer/BuildStats"
import Modal from "../elements/Modal"
import ViewSlots from "./ViewSlots"

interface BuildCardStatsProps {
  build: Build
  closeModal: () => void
}

const unchangingBonus = {}

const BuildCardStats: React.FC<BuildCardStatsProps> = ({
  build,
  closeModal,
}) => {
  const explanations = useAbilityEffects(build, unchangingBonus, 0)

  const defaultBuild: Partial<Build> = {
    weapon: build.weapon,
    headgear: ["UNKNOWN", "UNKNOWN", "UNKNOWN", "UNKNOWN"],
    clothing: ["UNKNOWN", "UNKNOWN", "UNKNOWN", "UNKNOWN"],
    shoes: ["UNKNOWN", "UNKNOWN", "UNKNOWN", "UNKNOWN"],
  }
  const zeroExplanations = useAbilityEffects(defaultBuild, unchangingBonus, 0)
  return (
    <Modal
      title={`Stats of ${build.weapon} build by ${
        build.discord_user!.username
      }`}
      closeModal={closeModal}
      closeOnOutsideClick
    >
      <ViewSlots build={build} />
      <BuildStats
        build={build}
        explanations={explanations}
        otherExplanations={zeroExplanations}
      />
    </Modal>
  )
}

export default BuildCardStats
