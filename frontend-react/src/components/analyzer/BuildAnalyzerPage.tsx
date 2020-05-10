import { Box } from "@chakra-ui/core"
import { RouteComponentProps } from "@reach/router"
import React, { useState } from "react"
import { Helmet } from "react-helmet-async"
import useAbilityEffects from "../../hooks/useAbilityEffects"
import { Build } from "../../types"
import PageHeader from "../common/PageHeader"
import WeaponSelector from "../common/WeaponSelector"
import BuildStats from "./BuildStats"
import EditableBuild from "./EditableBuild"

const BuildAnalyzerPage: React.FC<RouteComponentProps> = () => {
  const [build, setBuild] = useState<Partial<Build>>({
    weapon: "Splattershot Jr.",
    headgear: ["UNKNOWN", "UNKNOWN", "UNKNOWN", "UNKNOWN"],
    clothing: ["UNKNOWN", "UNKNOWN", "UNKNOWN", "UNKNOWN"],
    shoes: ["UNKNOWN", "UNKNOWN", "UNKNOWN", "UNKNOWN"],
  })
  const explanations = useAbilityEffects(build)

  console.log("explanations", explanations)

  return (
    <>
      <Helmet>
        <title>Build Analyzer | sendou.ink</title>
      </Helmet>
      <PageHeader title="Build Analyzer" />
      <Box my="1em">
        <WeaponSelector
          value={build.weapon}
          label=""
          setValue={(weapon) => setBuild({ ...build, weapon })}
          menuIsOpen={!build.weapon}
        />
      </Box>
      <Box my="1em">
        <BuildStats build={build} explanations={explanations} />
      </Box>
      <EditableBuild build={build} setBuild={setBuild} />
    </>
  )
}

export default BuildAnalyzerPage
