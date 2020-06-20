import React from "react"
import { useContext } from "react"
import MyThemeContext from "../../themeContext"
import Select from "../elements/Select"
import { Box } from "@chakra-ui/core"
import { Stage } from "../../types"

interface MapSelectProps {
  map: string | null
  setMap: (map: string) => void
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

const reversedCodes = [
  ["Ancho-V Games", "AG"],
  ["Arowana Mall", "AM"],
  ["Blackbelly Skatepark", "BS"],
  ["Camp Triggerfish", "CT"],
  ["Goby Arena", "GA"],
  ["Humpback Pump Track", "HP"],
  ["Inkblot Art Academy", "IA"],
  ["Kelp Dome", "KD"],
  ["Musselforge Fitness", "MF"],
  ["MakoMart", "MK"],
  ["Manta Maria", "MM"],
  ["Moray Towers", "MT"],
  ["New Albacore Hotel", "NA"],
  ["Port Mackerel", "PM"],
  ["Piranha Pit", "PP"],
  ["Snapper Canal", "SC"],
  ["Shellendorf Institute", "SI"],
  ["Starfish Mainstage", "SM"],
  ["Skipper Pavilion", "SP"],
  ["Sturgeon Shipyard", "SS"],
  ["The Reef", "TR"],
  ["Wahoo World", "WH"],
  ["Walleye Warehouse", "WW"],
] as const

const codeToStage = new Map(codes)
const stageToCode = new Map(reversedCodes)

const MapSelect: React.FC<MapSelectProps> = ({ map, setMap }) => {
  const { darkerBgColor } = useContext(MyThemeContext)

  const handleChange = (stage: any) => {
    setMap(
      `${process.env.PUBLIC_URL}/plannerMaps/M ${stageToCode.get(stage)} SZ.png`
    )
  }

  return (
    <Box w="250px">
      <Select options={maps} setValue={handleChange} />
    </Box>
  )
}

export default MapSelect
