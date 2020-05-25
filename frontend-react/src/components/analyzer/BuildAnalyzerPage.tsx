import { Box, FormLabel, Switch, Badge, Flex } from "@chakra-ui/core"
import { RouteComponentProps } from "@reach/router"
import React, { useState, useContext } from "react"
import { Helmet } from "react-helmet-async"
import useAbilityEffects from "../../hooks/useAbilityEffects"
import { Build } from "../../types"
import PageHeader from "../common/PageHeader"
import WeaponSelector from "../common/WeaponSelector"
import BuildStats from "./BuildStats"
import EditableBuilds from "./EditableBuilds"
import MyThemeContext from "../../themeContext"
import { FaWrench } from "react-icons/fa"
import Button from "../elements/Button"

const defaultBuild: Partial<Build> = {
  headgear: ["UNKNOWN", "UNKNOWN", "UNKNOWN", "UNKNOWN"],
  clothing: ["UNKNOWN", "UNKNOWN", "UNKNOWN", "UNKNOWN"],
  shoes: ["UNKNOWN", "UNKNOWN", "UNKNOWN", "UNKNOWN"],
}

const BuildAnalyzerPage: React.FC<RouteComponentProps> = () => {
  const { themeColor, grayWithShade } = useContext(MyThemeContext)
  const [build, setBuild] = useState<Partial<Build>>(defaultBuild)
  const [otherBuild, setOtherBuild] = useState<Partial<Build>>(defaultBuild)
  const [showOther, setShowOther] = useState(false)
  const [showNotActualProgress, setShowNotActualProgress] = useState(false)
  const [startChartsAtZero, setStartChartsAtZero] = useState(true)
  const [otherFocused, setOtherFocused] = useState(false)
  const [hideExtra, setHideExtra] = useState(true)
  const [showSettings, setShowSettings] = useState(false)

  const explanations = useAbilityEffects(build)
  const otherExplanations = useAbilityEffects(otherBuild)

  return (
    <>
      <Helmet>
        <title>Build Analyzer | sendou.ink</title>
      </Helmet>
      <PageHeader title="Build Analyzer" />
      <Flex justifyContent="space-between">
        <Badge variantColor={themeColor}>Patch 5.2.</Badge>
        <Box color={grayWithShade} fontSize="0.75em">
          AP = Ability Point = Mains * 10 + Subs * 3
        </Box>
      </Flex>

      <Box my="1em">
        <WeaponSelector
          value={build.weapon}
          label=""
          setValue={(weapon) => {
            setBuild({ ...build, weapon })
            setOtherBuild({ ...otherBuild, weapon })
          }}
          menuIsOpen={!build.weapon}
        />
      </Box>
      {build.weapon && (
        <EditableBuilds
          build={build}
          otherBuild={otherBuild}
          setBuild={otherFocused ? setOtherBuild : setBuild}
          showOther={showOther}
          setShowOther={setShowOther}
          changeFocus={() => {
            setOtherFocused(!otherFocused)
          }}
          otherFocused={otherFocused}
        />
      )}
      <Button
        icon={FaWrench}
        onClick={() => setShowSettings(!showSettings)}
        mt="1em"
      >
        {showSettings ? "Hide settings" : "Show settings"}
      </Button>
      {showSettings && (
        <Box my="1em">
          <Switch
            id="show-all"
            color={themeColor}
            isChecked={hideExtra}
            onChange={() => setHideExtra(!hideExtra)}
            mr="0.5em"
          />
          <FormLabel htmlFor="show-all">Hide stats at base value</FormLabel>

          <Box>
            <Switch
              id="show-not-actual"
              color={themeColor}
              isChecked={showNotActualProgress}
              onChange={() => setShowNotActualProgress(!showNotActualProgress)}
              mr="0.5em"
            />
            <FormLabel htmlFor="show-not-actual">
              Progress bars show progress to max value
            </FormLabel>
          </Box>
          <Box>
            <Switch
              id="charts-zero"
              color={themeColor}
              isChecked={startChartsAtZero}
              onChange={() => setStartChartsAtZero(!startChartsAtZero)}
              mr="0.5em"
            />
            <FormLabel htmlFor="charts-zero">
              Start charts Y axis from zero
            </FormLabel>
          </Box>
        </Box>
      )}
      <Box my="1em">
        <BuildStats
          build={build}
          explanations={explanations}
          otherExplanations={showOther ? otherExplanations : undefined}
          hideExtra={hideExtra}
          showNotActualProgress={showNotActualProgress}
          startChartsAtZero={startChartsAtZero}
        />
      </Box>
    </>
  )
}

export default BuildAnalyzerPage
