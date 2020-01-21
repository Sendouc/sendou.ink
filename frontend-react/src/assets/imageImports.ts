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
import UNKNOWN from "./abilityIcons/UNKNOWN.png"
import * as top500logo from "./top500.png"

//https://stackoverflow.com/questions/42118296/dynamically-import-images-from-a-directory-using-webpack
export const wpnSmall: object = importAll(require.context("./wpnSmall", false))
export const wpnMedium: object = importAll(
  require.context("./wpnMedium", false)
)

function importAll(r: __WebpackModuleApi.RequireContext) {
  const images: any = {}
  r.keys().forEach(item => {
    images[item.substring(6, item.length - 4)] = r(item)
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
  AD: AD,
  UNKNOWN: UNKNOWN,
  "": UNKNOWN,
} as const

export const top500 = top500logo
