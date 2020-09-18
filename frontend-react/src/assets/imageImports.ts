import AD from "./abilityIcons/AD.png"
import BDU from "./abilityIcons/BDU.png"
import BRU from "./abilityIcons/BRU.png"
import CB from "./abilityIcons/CB.png"
import DR from "./abilityIcons/DR.png"
import EMPTY from "./abilityIcons/EMPTY.png"
import H from "./abilityIcons/H.png"
import ISM from "./abilityIcons/ISM.png"
import ISS from "./abilityIcons/ISS.png"
import LDE from "./abilityIcons/LDE.png"
import MPU from "./abilityIcons/MPU.png"
import NS from "./abilityIcons/NS.png"
import OG from "./abilityIcons/OG.png"
import OS from "./abilityIcons/OS.png"
import QR from "./abilityIcons/QR.png"
import QSJ from "./abilityIcons/QSJ.png"
import REC from "./abilityIcons/REC.png"
import RES from "./abilityIcons/RES.png"
import RP from "./abilityIcons/RP.png"
import RSU from "./abilityIcons/RSU.png"
import SCU from "./abilityIcons/SCU.png"
import SJ from "./abilityIcons/SJ.png"
import SPU from "./abilityIcons/SPU.png"
import SS from "./abilityIcons/SS.png"
import SSU from "./abilityIcons/SSU.png"
import T from "./abilityIcons/T.png"
import TI from "./abilityIcons/TI.png"
import UNKNOWN from "./abilityIcons/UNKNOWN.png"
import boingOctoDrawingDark from "./b8ing_dark.png"
import boingOctoDrawingLight from "./b8ing_light.png"
import boingDrawingDark from "./boing_dark.png"
import boingDrawingLight from "./boing_light.png"
import firstPlace from "./first_place.png"
import anchov_games_thumbnail from "./mapThumbnails/ancho-v_games.png"
import arowana_mall_thumbnail from "./mapThumbnails/arowana_mall.png"
import blackbelly_skatepark_thumbnail from "./mapThumbnails/blackbelly_skatepark.png"
import camp_triggerfish_thumbnail from "./mapThumbnails/camp_triggerfish.png"
import goby_arena_thumbnail from "./mapThumbnails/goby_arena.png"
import humpback_pump_track_thumbnail from "./mapThumbnails/humpback_pump_track.png"
import inkblot_art_academy_thumbnail from "./mapThumbnails/inkblot_art_academy.png"
import kelp_dome_thumbnail from "./mapThumbnails/kelp_dome.png"
import makomart_thumbnail from "./mapThumbnails/makomart.png"
import manta_maria_thumbnail from "./mapThumbnails/manta_maria.png"
import moray_towers_thumbnail from "./mapThumbnails/moray_towers.png"
import musselforge_fitness_thumbnail from "./mapThumbnails/musselforge_fitness.png"
import new_albacore_hotel_thumbnail from "./mapThumbnails/new_albacore_hotel.png"
import piranha_pit_thumbnail from "./mapThumbnails/piranha_pit.png"
import port_mackerel_thumbnail from "./mapThumbnails/port_mackerel.png"
import shellendorf_institute_thumbnail from "./mapThumbnails/shellendorf_institute.png"
import skipper_pavilion_thumbnail from "./mapThumbnails/skipper_pavilion.png"
import snapper_canal_thumbnail from "./mapThumbnails/snapper_canal.png"
import starfish_mainstage_thumbnail from "./mapThumbnails/starfish_mainstage.png"
import sturgeon_shipyard_thumbnail from "./mapThumbnails/sturgeon_shipyard.png"
import the_reef_thumbnail from "./mapThumbnails/the_reef.png"
import wahoo_world_thumbnail from "./mapThumbnails/wahoo_world.png"
import walleye_warehouse_thumbnail from "./mapThumbnails/walleye_warehouse.png"
import posterGirlDrawingDark from "./poster_girl_dark.png"
import posterGirlDrawingLight from "./poster_girl_light.png"
import secondPlace from "./second_place.png"
import alfonsino from "./Splatoon1Maps/alfonsino.png"
import bluefin from "./Splatoon1Maps/bluefin.png"
import bridge from "./Splatoon1Maps/bridge.png"
import flounder from "./Splatoon1Maps/flounder.png"
import resort from "./Splatoon1Maps/resort.png"
import rig from "./Splatoon1Maps/rig.png"
import underpass from "./Splatoon1Maps/underpass.png"
import thirdPlace from "./third_place.png"
import * as top500logo from "./top500.png"

export const abilityIcons = {
  BDU,
  BRU,
  CB,
  DR,
  H,
  ISM,
  ISS,
  LDE,
  MPU,
  NS,
  OG,
  QR,
  QSJ,
  REC,
  RES,
  RP,
  RSU,
  SCU,
  SJ,
  SPU,
  SS,
  SSU,
  T,
  TI,
  OS,
  AD,
  UNKNOWN,
  "": UNKNOWN,
  EMPTY,
} as const

export const top500 = top500logo

export const posterGirl = {
  light: posterGirlDrawingLight,
  dark: posterGirlDrawingDark,
}

export const footerSquid = {
  light: boingDrawingLight,
  dark: boingDrawingDark,
}

export const footerOcto = {
  light: boingOctoDrawingLight,
  dark: boingOctoDrawingDark,
}

export const medalEmoji = [null, firstPlace, secondPlace, thirdPlace] as const

export const mapIcons: { [key: string]: string } = {
  "Arowana Mall": arowana_mall_thumbnail,
  "Ancho-V Games": anchov_games_thumbnail,
  "Blackbelly Skatepark": blackbelly_skatepark_thumbnail,
  "Camp Triggerfish": camp_triggerfish_thumbnail,
  "Goby Arena": goby_arena_thumbnail,
  "Humpback Pump Track": humpback_pump_track_thumbnail,
  "Inkblot Art Academy": inkblot_art_academy_thumbnail,
  "Kelp Dome": kelp_dome_thumbnail,
  MakoMart: makomart_thumbnail,
  "Manta Maria": manta_maria_thumbnail,
  "Moray Towers": moray_towers_thumbnail,
  "Musselforge Fitness": musselforge_fitness_thumbnail,
  "New Albacore Hotel": new_albacore_hotel_thumbnail,
  "Piranha Pit": piranha_pit_thumbnail,
  "Port Mackerel": port_mackerel_thumbnail,
  "Shellendorf Institute": shellendorf_institute_thumbnail,
  "Skipper Pavilion": skipper_pavilion_thumbnail,
  "Snapper Canal": snapper_canal_thumbnail,
  "Starfish Mainstage": starfish_mainstage_thumbnail,
  "Sturgeon Shipyard": sturgeon_shipyard_thumbnail,
  "The Reef": the_reef_thumbnail,
  "Wahoo World": wahoo_world_thumbnail,
  "Walleye Warehouse": walleye_warehouse_thumbnail,
} as const

export const Splatoon1Maps = [
  {
    image: alfonsino,
    name: "Museum D'Alfonsino",
  },
  {
    image: bluefin,
    name: "Bluefin Depot",
  },
  {
    image: bridge,
    name: "Hammerhead Bridge",
  },
  {
    image: flounder,
    name: "Flounder Heights",
  },
  {
    image: resort,
    name: "Mahi-Mahi Resort",
  },
  {
    image: rig,
    name: "Saltspray Rig",
  },
  {
    image: underpass,
    name: "Urchin Underpass",
  },
]
