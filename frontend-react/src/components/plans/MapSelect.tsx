import React from "react"
import { Select } from "@chakra-ui/core"
import { useContext } from "react"
import MyThemeContext from "../../themeContext"

import academy from "../../assets/plannerMaps/academy-sz.png"
import arena from "../../assets/plannerMaps/arena-sz.png"
import camp from "../../assets/plannerMaps/camp-sz.png"
import canal from "../../assets/plannerMaps/canal-sz.png"
import dome from "../../assets/plannerMaps/dome-sz.png"
import fitness from "../../assets/plannerMaps/fitness-sz.png"
import games from "../../assets/plannerMaps/games-sz.png"
import hotel from "../../assets/plannerMaps/hotel-sz.png"
import institute from "../../assets/plannerMaps/institute-sz.png"
import mainstage from "../../assets/plannerMaps/mainstage-sz.png"
import mall from "../../assets/plannerMaps/mall-sz.png"
import manta from "../../assets/plannerMaps/manta-sz.png"
import mart from "../../assets/plannerMaps/mart-sz.png"
import pavilion from "../../assets/plannerMaps/pavilion-sz.png"
import pit from "../../assets/plannerMaps/pit-sz.png"
import pitrm from "../../assets/plannerMaps/pit-rm.png"
import port from "../../assets/plannerMaps/port-sz.png"
import pumptrack from "../../assets/plannerMaps/pumptrack-sz.png"
import reef from "../../assets/plannerMaps/reef-sz.png"
import shipyard from "../../assets/plannerMaps/shipyard-sz.png"
import skatepark from "../../assets/plannerMaps/skatepark-sz.png"
import towers from "../../assets/plannerMaps/towers-sz.png"
import warehouse from "../../assets/plannerMaps/warehouse-sz.png"
import world from "../../assets/plannerMaps/world-sz.png"

interface MapSelectProps {
  map: string | null
  setMap: (map: string) => void
}

const maps = [
  { key: "The Reef", text: "The Reef", value: reef },
  {
    key: "Musselforge Fitness",
    text: "Musselforge Fitness",
    value: fitness,
  },
  {
    key: "Starfish Mainstage",
    text: "Starfish Mainstage",
    value: mainstage,
  },
  {
    key: "Humpback Pump Track",
    text: "Humpback Pump Track",
    value: pumptrack,
  },
  {
    key: "Inkblot Art Academy",
    text: "Inkblot Art Academy",
    value: academy,
  },
  {
    key: "Sturgeon Shipyard",
    text: "Sturgeon Shipyard",
    value: shipyard,
  },
  { key: "Moray Towers", text: "Moray Towers", value: towers },
  { key: "Port Mackerel", text: "Port Mackerel", value: port },
  { key: "Manta Maria", text: "Manta Maria", value: manta },
  { key: "Kelp Dome", text: "Kelp Dome", value: dome },
  { key: "Snapper Canal", text: "Snapper Canal", value: canal },
  {
    key: "Blackbelly Skatepark",
    text: "Blackbelly Skatepark",
    value: skatepark,
  },
  { key: "MakoMart", text: "MakoMart", value: mart },
  {
    key: "Walleye Warehouse",
    text: "Walleye Warehouse",
    value: warehouse,
  },
  {
    key: "Shellendorf Institute",
    text: "Shellendorf Institute",
    value: institute,
  },
  { key: "Arowana Mall", text: "Arowana Mall", value: mall },
  { key: "Goby Arena", text: "Goby Arena", value: arena },
  { key: "Piranha Pit", text: "Piranha Pit", value: pit },
  {
    key: "Piranha Pit (RM)",
    text: "Piranha Pit (RM)",
    value: pitrm,
  },
  {
    key: "Camp Triggerfish",
    text: "Camp Triggerfish",
    value: camp,
  },
  { key: "Wahoo World", text: "Wahoo World", value: world },
  {
    key: "New Albacore Hotel",
    text: "New Albacore Hotel",
    value: hotel,
  },
  { key: "Ancho-V Games", text: "Ancho-V Games", value: games },
  {
    key: "Skipper Pavilion",
    text: "Skipper Pavilion",
    value: pavilion,
  },
]

const MapSelect: React.FC<MapSelectProps> = ({ map, setMap }) => {
  const { darkerBgColor } = useContext(MyThemeContext)
  return (
    <Select
      placeholder="Select map"
      value={map ?? ""}
      onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
        setMap(event.target.value)
      }
      width="250px"
    >
      {maps.map(map => (
        <option
          key={map.key}
          value={map.value}
          style={{ background: darkerBgColor }}
        >
          {map.text}
        </option>
      ))}
    </Select>
  )
}

export default MapSelect
