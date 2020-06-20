import React from "react"
import { useContext } from "react"
import MyThemeContext from "../../themeContext"
import Select from "../elements/Select"
import { Box, Flex, FormLabel, Switch } from "@chakra-ui/core"
import { Stage } from "../../types"
import { PlannerMapBg } from "./MapPlannerPage"
import ModeButtons from "../xtrends/ModeButtons"

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

const codes = [
  ["AG", "Ancho-V Games"],
  ["AM", "Arowana Mall"],
  ["BS", "Blackbelly Skatepark"],
  ["CT", "Camp Triggerfish"],
  ["GA", "Goby Arena"],
  ["HP", "Humpback Pump Track"],
  ["IA", "Inkblot Art Academy"],
  ["KD", "Kelp Dome"],
  ["MF", "Musselforge Fitness"],
  ["MK", "MakoMart"],
  ["MM", "Manta Maria"],
  ["MT", "Moray Towers"],
  ["NA", "New Albacore Hotel"],
  ["PM", "Port Mackerel"],
  ["PP", "Piranha Pit"],
  ["SC", "Snapper Canal"],
  ["SI", "Shellendorf Institute"],
  ["SM", "Starfish Mainstage"],
  ["SP", "Skipper Pavilion"],
  ["SS", "Sturgeon Shipyard"],
  ["TR", "The Reef"],
  ["WH", "Wahoo World"],
  ["WW", "Walleye Warehouse"],
] as const

const codeToStage = new Map(codes)

const MapSelect: React.FC<MapSelectProps> = ({ bg, setBg }) => {
  const { themeColor } = useContext(MyThemeContext)

  return (
    <Flex
      w="400px"
      h="300px"
      rounded="lg"
      overflow="hidden"
      boxShadow="0px 0px 16px 6px rgba(0,0,0,0.1)"
      p="20px"
      justify="space-evenly"
      flexDir="column"
    >
      <Select
        options={maps}
        value={{ label: bg.stage, value: bg.stage }}
        setValue={(value: any) => setBg({ ...bg, stage: value })}
        isSearchable
      />
      <Flex justify="center">
        <ModeButtons
          mode={bg.mode}
          setMode={(mode) => setBg({ ...bg, mode })}
          showTW
        />
      </Flex>
      <Flex justify="space-evenly" align="center" my="1em">
        <FormLabel htmlFor="email-alerts">Minimap</FormLabel>
        <Switch
          color={themeColor}
          isChecked={bg.view === "R"}
          onChange={() => setBg({ ...bg, view: bg.view === "R" ? "M" : "R" })}
        />
        <FormLabel htmlFor="email-alerts">Top-down</FormLabel>
      </Flex>
    </Flex>
  )
}

export default MapSelect
