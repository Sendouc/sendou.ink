import React from 'react'

import top500 from './misc/top500.png'
import BDU from './abilityIcons/BDU.png'
import BRU from './abilityIcons/BRU.png'
import CB from './abilityIcons/CB.png'
import DR from './abilityIcons/DR.png'
import H from './abilityIcons/H.png'
import ISM from './abilityIcons/ISM.png'
import ISS from './abilityIcons/ISS.png'
import LDE from './abilityIcons/LDE.png'
import MPU from './abilityIcons/MPU.png'
import NS from './abilityIcons/NS.png'
import OG from './abilityIcons/OG.png'
import QR from './abilityIcons/QR.png'
import QSJ from './abilityIcons/QSJ.png'
import REC from './abilityIcons/REC.png'
import RES from './abilityIcons/RES.png'
import RP from './abilityIcons/RP.png'
import RSU from './abilityIcons/RSU.png'
import SCU from './abilityIcons/SCU.png'
import SJ from './abilityIcons/SJ.png'
import SPU from './abilityIcons/SPU.png'
import SS from './abilityIcons/SS.png'
import SSU from './abilityIcons/SSU.png'
import T from './abilityIcons/T.png'
import TI from './abilityIcons/TI.png'
import OS from './abilityIcons/OS.png'

import SplatZ from './modeIcons/sz.png'
import TowerC from './modeIcons/tc.png'
import RainM from './modeIcons/rm.png'
import ClamB from './modeIcons/cb.png'

export const abilities = {
  "BDU": {image: BDU, fullName: "Bomb Defense Up DX"},
  "BRU": {image: BRU, fullName: "Sub Power Up"},
  "CB": {image: CB, fullName: "Comeback", mainOnly: true},
  "DR": {image: DR, fullName: "Drop Roller", mainOnly: true},
  "H": {image: H, fullName: "Haunt", mainOnly: true},
  "ISM": {image: ISM, fullName: "Ink Saver (Main)"},
  "ISS": {image: ISS, fullName: "Ink Saver (Sub)"},
  "LDE": {image: LDE, fullName: "Last-Ditch Effort", mainOnly: true},
  "MPU": {image: MPU, fullName: "Main Power Up"},
  "NS": {image: NS, fullName: "Ninja Squid", mainOnly: true},
  "OG": {image: OG, fullName: "Opening Gambit", mainOnly: true},
  "QR": {image: QR, fullName: "Quick Respawn"},
  "QSJ": {image: QSJ, fullName: "Quick Super Jump"},
  "REC": {image: REC, fullName: "Ink Recovery Up"},
  "RES": {image: RES, fullName: "Ink Resistance Up"},
  "RP": {image: RP, fullName: "Respawn Punisher", mainOnly: true},
  "RSU": {image: RSU, fullName: "Run Speed Up"},
  "SCU": {image: SCU, fullName: "Special Charge Up"},
  "SJ": {image: SJ, fullName: "Stealth Jump", mainOnly: true},
  "SPU": {image: SPU, fullName: "Special Power Up"},
  "SS": {image: SS, fullName: "Special Saver"},
  "SSU": {image: SSU, fullName: "Swim Speed Up"},
  "T": {image: T, fullName: "Tenacity", mainOnly: true},
  "TI": {image: TI, fullName: "Thermal Ink", mainOnly: true},
  "OS": {image: OS, fullName: "Object Shredder", mainOnly: true}
}

export const modesArr = [null, SplatZ, TowerC, RainM, ClamB]

export const top500crown = top500

export const discordLogoSvg = () => <svg viewBox="0 0 245 240" width="1em" height="1em"><path fill="#FFFFFF" d="M104.4 103.9c-5.7 0-10.2 5-10.2 11.1s4.6 11.1 10.2 11.1c5.7 0 10.2-5 10.2-11.1.1-6.1-4.5-11.1-10.2-11.1zM140.9 103.9c-5.7 0-10.2 5-10.2 11.1s4.6 11.1 10.2 11.1c5.7 0 10.2-5 10.2-11.1s-4.5-11.1-10.2-11.1z"/><path fill="#FFFFFF" d="M189.5 20h-134C44.2 20 35 29.2 35 40.6v135.2c0 11.4 9.2 20.6 20.5 20.6h113.4l-5.3-18.5 12.8 11.9 12.1 11.2 21.5 19V40.6c0-11.4-9.2-20.6-20.5-20.6zm-38.6 130.6s-3.6-4.3-6.6-8.1c13.1-3.7 18.1-11.9 18.1-11.9-4.1 2.7-8 4.6-11.5 5.9-5 2.1-9.8 3.5-14.5 4.3-9.6 1.8-18.4 1.3-25.9-.1-5.7-1.1-10.6-2.7-14.7-4.3-2.3-.9-4.8-2-7.3-3.4-.3-.2-.6-.3-.9-.5-.2-.1-.3-.2-.4-.3-1.8-1-2.8-1.7-2.8-1.7s4.8 8 17.5 11.8c-3 3.8-6.7 8.3-6.7 8.3-22.1-.7-30.5-15.2-30.5-15.2 0-32.2 14.4-58.3 14.4-58.3 14.4-10.8 28.1-10.5 28.1-10.5l1 1.2c-18 5.2-26.3 13.1-26.3 13.1s2.2-1.2 5.9-2.9c10.7-4.7 19.2-6 22.7-6.3.6-.1 1.1-.2 1.7-.2 6.1-.8 13-1 20.2-.2 9.5 1.1 19.7 3.9 30.1 9.6 0 0-7.9-7.5-24.9-12.7l1.4-1.6s13.7-.3 28.1 10.5c0 0 14.4 26.1 14.4 58.3 0 0-8.5 14.5-30.6 15.2z"/></svg>