import { Box, FormLabel, Switch, Badge } from "@chakra-ui/core"
import { RouteComponentProps } from "@reach/router"
import React, { useState, useContext } from "react"
import { Helmet } from "react-helmet-async"
import useAbilityEffects from "../../hooks/useAbilityEffects"
import { Build } from "../../types"
import PageHeader from "../common/PageHeader"
import WeaponSelector from "../common/WeaponSelector"
import BuildStats from "./BuildStats"
import EditableBuild from "./EditableBuild"
import MyThemeContext from "../../themeContext"

const BuildAnalyzerPage: React.FC<RouteComponentProps> = () => {
  const { themeColor } = useContext(MyThemeContext)
  const [build, setBuild] = useState<Partial<Build>>({
    weapon: "Splattershot Jr.",
    headgear: ["UNKNOWN", "UNKNOWN", "UNKNOWN", "UNKNOWN"],
    clothing: ["UNKNOWN", "UNKNOWN", "UNKNOWN", "UNKNOWN"],
    shoes: ["UNKNOWN", "UNKNOWN", "UNKNOWN", "UNKNOWN"],
  })
  const [hideExtra, setHideExtra] = useState(true)
  const explanations = useAbilityEffects(build)

  console.log("explanations", explanations)

  return (
    <>
      <Helmet>
        <title>Build Analyzer | sendou.ink</title>
      </Helmet>
      <PageHeader title="Build Analyzer" />
      <Badge variantColor={themeColor}>Patch 5.2.</Badge>
      <Box my="1em">
        <WeaponSelector
          value={build.weapon}
          label=""
          setValue={(weapon) => setBuild({ ...build, weapon })}
          menuIsOpen={!build.weapon}
        />
      </Box>
      <EditableBuild build={build} setBuild={setBuild} />
      <Box my="1em">
        <FormLabel htmlFor="show-all">Hide stats at base value</FormLabel>
        <Switch
          id="show-all"
          color={themeColor}
          isChecked={hideExtra}
          onChange={() => setHideExtra(!hideExtra)}
        />
      </Box>
      <Box my="1em">
        <BuildStats
          build={build}
          explanations={explanations}
          hideExtra={hideExtra}
        />
      </Box>
    </>
  )
}

export default BuildAnalyzerPage
