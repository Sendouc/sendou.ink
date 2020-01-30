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
import EMPTY from "./abilityIcons/EMPTY.png"
import * as top500logo from "./top500.png"

import posterGirlDrawingDark from "./poster_girl_dark.png"
import posterGirlDrawingLight from "./poster_girl_light.png"
import boingDrawingDark from "./boing_dark.png"
import boingDrawingLight from "./boing_light.png"
import boingOctoDrawingDark from "./b8ing_dark.png"
import boingOctoDrawingLight from "./b8ing_light.png"

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
