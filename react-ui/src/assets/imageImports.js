import BDU from "./abilityIcons/BDU.png"
import BRU from "./abilityIcons/BRU.png"
import CB from "./abilityIcons/CB.png"
import DR from "./abilityIcons/DR.png"
import H from "./abilityIcons/H.png"
import ISM from "./abilityIcons/ISM.png"
import ISS from "./abilityIcons/ISS.png"
import LDE from "./abilityIcons/LDE.png"
import MPU from "./abilityIcons/MPU.png"
import NS from "./abilityIcons/NS.png"
import OG from "./abilityIcons/OG.png"
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
import OS from "./abilityIcons/OS.png"
import AD from "./abilityIcons/AD.png"

import szIcon from "./sz.png"
import tcIcon from "./tc.png"
import rmIcon from "./rm.png"
import cbIcon from "./cb.png"
import twIcon from "./tw.png"

import arowana_mall_thumbnail from "./mapThumbnails/arowana_mall.png"
import anchov_games_thumbnail from "./mapThumbnails/ancho-v_games.png"
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

//https://stackoverflow.com/questions/42118296/dynamically-import-images-from-a-directory-using-webpack
export const wpnSmall = importAll(require.context("./wpnSmall", false))
export const wpnMedium = importAll(require.context("./wpnMedium", false))

function importAll(r, substringStart = 6, substringEnd = 4) {
  let images = {}
  r.keys().forEach(item => {
    images[item.substring(substringStart, item.length - substringEnd)] = r(item)
  })
  return images
}

export const abilityIcons = {
  BDU: BDU,
  BRU: BRU,
  CB: CB,
  DR: DR,
  H: H,
  ISM: ISM,
  ISS: ISS,
  LDE: LDE,
  MPU: MPU,
  NS: NS,
  OG: OG,
  QR: QR,
  QSJ: QSJ,
  REC: REC,
  RES: RES,
  RP: RP,
  RSU: RSU,
  SCU: SCU,
  SJ: SJ,
  SPU: SPU,
  SS: SS,
  SSU: SSU,
  T: T,
  TI: TI,
  OS: OS,
  AD: AD
}

export const abilitiesGameOrder = [
  "ISM",
  "ISS",
  "REC",
  "RSU",
  "SSU",
  "SCU",
  "SS",
  "SPU",
  "QR",
  "QSJ",
  "BRU",
  "RES",
  "BDU",
  "MPU",
  "OG",
  "LDE",
  "T",
  "CB",
  "NS",
  "H",
  "TI",
  "RP",
  "AD",
  "SJ",
  "OS",
  "DR"
]

export const mapIcons = {
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
  "Walleye Warehouse": walleye_warehouse_thumbnail
}

export const modeIcons = {
  "Splat Zones": szIcon,
  "Tower Control": tcIcon,
  Rainmaker: rmIcon,
  "Clam Blitz": cbIcon,
  SZ: szIcon,
  TC: tcIcon,
  RM: rmIcon,
  CB: cbIcon,
  TW: twIcon
}
