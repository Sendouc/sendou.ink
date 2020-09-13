import { Badge, Box, Flex, FormLabel, Switch } from "@chakra-ui/core"
import { RouteComponentProps, useLocation } from "@reach/router"
import React, { useContext, useEffect, useState } from "react"
import { Helmet } from "react-helmet-async"
import { Trans, useTranslation } from "react-i18next"
import { FaWrench } from "react-icons/fa"
import useAbilityEffects from "../../hooks/useAbilityEffects"
import MyThemeContext from "../../themeContext"
import { Ability, AnalyzerBuild, Weapon } from "../../types"
import PageHeader from "../common/PageHeader"
import WeaponSelector from "../common/WeaponSelector"
import Button from "../elements/Button"
import BuildStats from "./BuildStats"
import EditableBuilds from "./EditableBuilds"

const CURRENT_PATCH = "5.3."

type AnalyzerBuildNoWeapon = Omit<AnalyzerBuild, "weapon">

const defaultBuild: AnalyzerBuildNoWeapon = {
  headgear: ["UNKNOWN", "UNKNOWN", "UNKNOWN", "UNKNOWN"],
  clothing: ["UNKNOWN", "UNKNOWN", "UNKNOWN", "UNKNOWN"],
  shoes: ["UNKNOWN", "UNKNOWN", "UNKNOWN", "UNKNOWN"],
}

const BuildAnalyzerPage: React.FC<RouteComponentProps> = () => {
  const { themeColor, grayWithShade } = useContext(MyThemeContext)
  const { t } = useTranslation()
  const location = useLocation()
  const [build, setBuild] = useState<AnalyzerBuildNoWeapon>({ ...defaultBuild })
  const [otherBuild, setOtherBuild] = useState<AnalyzerBuildNoWeapon>({
    ...defaultBuild,
  })
  const [weapon, setWeapon] = useState<Weapon>("Splattershot Jr.")
  const [showOther, setShowOther] = useState(false)
  const [showNotActualProgress, setShowNotActualProgress] = useState(false)
  const [startChartsAtZero, setStartChartsAtZero] = useState(true)
  const [otherFocused, setOtherFocused] = useState(false)
  const [hideExtra, setHideExtra] = useState(true)
  const [showSettings, setShowSettings] = useState(false)

  const [bonusAp, setBonusAp] = useState<Partial<Record<Ability, boolean>>>({})
  const [otherBonusAp, setOtherBonusAp] = useState<
    Partial<Record<Ability, boolean>>
  >({})
  const [lde, setLde] = useState(0)
  const [otherLde, setOtherLde] = useState(0)

  const explanations = useAbilityEffects({ ...build, weapon }, bonusAp, lde)
  const otherExplanations = useAbilityEffects(
    { ...otherBuild, weapon },
    otherBonusAp,
    otherLde
  )

  function getBuildFromUrl() {
    const buildToReturn: AnalyzerBuild = {
      ...defaultBuild,
      weapon: "Splattershot Jr.",
    }
    const decoded = new URLSearchParams(location.search)

    for (const [key, value] of decoded) {
      switch (key) {
        case "weapon":
          buildToReturn.weapon = value as Weapon
          break
        case "headgear":
        case "clothing":
        case "shoes":
          const abilityKey = key as "headgear" | "clothing" | "shoes"
          buildToReturn[abilityKey] = value.split(",") as any
      }
    }

    return buildToReturn
  }

  useEffect(() => {
    const { weapon, ...buildFromUrl } = getBuildFromUrl()

    setWeapon(weapon)
    setBuild(buildFromUrl)
    // eslint-disable-next-line
  }, [])

  return (
    <>
      <Helmet>
        <title>{t("navigation;Build Analyzer")} | sendou.ink</title>
      </Helmet>
      <PageHeader title={t("navigation;Build Analyzer")} />
      <Flex justifyContent="space-between">
        <Badge colorScheme={themeColor}>
          <Trans i18nKey="analyzer;currentPatch">
            Patch {{ CURRENT_PATCH }}
          </Trans>
        </Badge>
        <Box color={grayWithShade} fontSize="0.75em">
          {t("analyzer;apExplanation")}
        </Box>
      </Flex>

      <Box my="1em">
        <WeaponSelector value={weapon} label="" setValue={setWeapon} />
      </Box>
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
        bonusAp={bonusAp}
        setBonusAp={setBonusAp}
        otherBonusAp={otherBonusAp}
        setOtherBonusAp={setOtherBonusAp}
        lde={lde}
        setLde={setLde}
        otherLde={otherLde}
        setOtherLde={setOtherLde}
      />
      <Button
        icon={<FaWrench />}
        onClick={() => setShowSettings(!showSettings)}
        mt="1em"
      >
        {showSettings
          ? t("analyzer;Hide settings")
          : t("analyzer;Show settings")}
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
          <FormLabel htmlFor="show-all">
            {t("analyzer;Hide stats at base value")}
          </FormLabel>

          <Box>
            <Switch
              id="show-not-actual"
              color={themeColor}
              isChecked={showNotActualProgress}
              onChange={() => setShowNotActualProgress(!showNotActualProgress)}
              mr="0.5em"
            />
            <FormLabel htmlFor="show-not-actual">
              {t("analyzer;Progress bars show progress to max value")}
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
              {t("analyzer;Start charts Y axis from zero")}
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
