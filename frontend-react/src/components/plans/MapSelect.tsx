import { Flex, FormLabel, Switch } from "@chakra-ui/core"
import React, { useContext } from "react"
import MyThemeContext from "../../themeContext"
import Select from "../elements/Select"
import ModeButtons from "../xtrends/ModeButtons"
import { PlannerMapBg } from "./MapPlannerPage"
import { useTranslation } from "react-i18next"

interface MapSelectProps {
  bg: PlannerMapBg
  setBg: React.Dispatch<React.SetStateAction<PlannerMapBg>>
}

const maps = [
  { label: "The Reef", value: "The Reef" },
  {
    label: "Musselforge Fitness",
    value: "Musselforge Fitness",
  },
  {
    label: "Starfish Mainstage",
    value: "Starfish Mainstage",
  },
  {
    label: "Humpback Pump Track",
    value: "Humpback Pump Track",
  },
  {
    label: "Inkblot Art Academy",
    value: "Inkblot Art Academy",
  },
  {
    label: "Sturgeon Shipyard",
    value: "Sturgeon Shipyard",
  },
  { label: "Moray Towers", value: "Moray Towers" },
  { label: "Port Mackerel", value: "Port Mackerel" },
  { label: "Manta Maria", value: "Manta Maria" },
  { label: "Kelp Dome", value: "Kelp Dome" },
  { label: "Snapper Canal", value: "Snapper Canal" },
  {
    label: "Blackbelly Skatepark",
    value: "Blackbelly Skatepark",
  },
  { label: "MakoMart", value: "MakoMart" },
  {
    label: "Walleye Warehouse",
    value: "Walleye Warehouse",
  },
  {
    label: "Shellendorf Institute",
    value: "Shellendorf Institute",
  },
  { label: "Arowana Mall", value: "Arowana Mall" },
  { label: "Goby Arena", value: "Goby Arena" },
  { label: "Piranha Pit", value: "Piranha Pit" },
  {
    label: "Camp Triggerfish",
    value: "Camp Triggerfish",
  },
  { label: "Wahoo World", value: "Wahoo World" },
  {
    label: "New Albacore Hotel",
    value: "New Albacore Hotel",
  },
  { label: "Ancho-V Games", value: "Ancho-V Games" },
  {
    label: "Skipper Pavilion",
    value: "Skipper Pavilion",
  },
]

const MapSelect: React.FC<MapSelectProps> = ({ bg, setBg }) => {
  const { themeColor } = useContext(MyThemeContext)
  const { t } = useTranslation()

  return (
    <Flex
      w="400px"
      h="500px"
      rounded="lg"
      overflow="hidden"
      boxShadow="0px 0px 16px 6px rgba(0,0,0,0.1)"
      p="20px"
      justify="space-evenly"
      flexDir="column"
    >
      <Select
        options={maps.map((stage) => ({
          value: stage.value,
          label: t(`game;${stage.label}`),
        }))}
        value={{ label: t(`game;${bg.stage}`), value: bg.stage }}
        setValue={(value: any) => setBg({ ...bg, stage: value })}
        isSearchable
      />
      <Flex justify="center">
        <ModeButtons
          mode={bg.mode}
          setMode={(mode) => setBg({ ...bg, mode })}
        />
      </Flex>
      <Flex justify="center" align="center" my="1em">
        <FormLabel htmlFor="view">{t("plans;Show top-down view")}</FormLabel>
        <Switch
          id="view"
          color={themeColor}
          isChecked={bg.view === "R"}
          onChange={() => setBg({ ...bg, view: bg.view === "R" ? "M" : "R" })}
        />
      </Flex>
    </Flex>
  )
}

export default MapSelect
