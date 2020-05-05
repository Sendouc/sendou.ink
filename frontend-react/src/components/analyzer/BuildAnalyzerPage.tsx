import React, { useState } from "react"
import { RouteComponentProps } from "@reach/router"
import PageHeader from "../common/PageHeader"
import { Build } from "../../types"
import EditableBuild from "./EditableBuild"
import useAbilityEffects from "../../hooks/useAbilityEffects"
import WeaponSelector from "../common/WeaponSelector"

const BuildAnalyzerPage: React.FC<RouteComponentProps> = () => {
  const [build, setBuild] = useState<Partial<Build>>({
    headgear: ["UNKNOWN", "UNKNOWN", "UNKNOWN", "UNKNOWN"],
    clothing: ["UNKNOWN", "UNKNOWN", "UNKNOWN", "UNKNOWN"],
    shoes: ["UNKNOWN", "UNKNOWN", "UNKNOWN", "UNKNOWN"],
  })
  const explanations = useAbilityEffects(build)

  console.log("explanations", explanations)

  return (
    <>
      <PageHeader title="Build Analyzer" />
      <EditableBuild
        build={build}
        setBuild={setBuild}
        explanations={explanations}
      />
      <WeaponSelector
        value={build.weapon}
        label=""
        setValue={(weapon) => setBuild({ ...build, weapon })}
      />
    </>
  )
}

export default BuildAnalyzerPage
