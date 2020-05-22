import { Build, Ability, Weapon, SubWeapon, SpecialWeapon } from "../types"
import { useEffect, useState } from "react"
import { getEffect } from "../utils/getAbilityEffect"
import weaponJson from "../utils/weapon_data.json"
import abilityJson from "../utils/ability_data.json"

export interface Explanation {
  title: string
  effect: string
  effectFromMax: number
  ability: Ability
  info?: string
}

interface WeaponDataFromJson {
  InkSaverLv?: "Middle" | "High" | string
  InkSaverType?: "A" | "B" | "C" | "D" | string
  Sub?: string
  Special?: string
  mInkConsume?: number
  mInkConsumeRepeat?: number
  mFullChargeInkConsume?: number
  mMinChargeInkConsume?: number
  mInkConsumeSplashJump?: number
  mInkConsumeSplashStand?: number
  mSideStepInkConsume?: number
  mInkConsumeUmbrella?: number
  ShotMoveVelType?: "A" | "B" | "C" | "D" | "E" | string
  MoveVelLv?: "Low" | "Middle" | "High" | string
  SpecialCost?: number
  //mBurst_PaintR?: number
  //mBurst_PaintRMid?: number
  //mBurst_PaintRHigh?: number
  //mTargetInCircleRadius?: number
  //mTargetInCircleRadiusMid?: number
  //mTargetInCircleRadiusHigh?: number
  //mPaintGauge_SpecialFrm?: number
}

function buildToAP(build: Partial<Build>) {
  const AP: Partial<Record<Ability, number>> = {}

  if (build.headgear) {
    build.headgear.forEach((ability, index) => {
      if (ability !== "UNKNOWN") {
        const existing = AP[ability] ?? 0
        const toAdd = index === 0 ? 10 : 3
        AP[ability] = existing + toAdd
      }
    })
  }

  if (build.clothing) {
    build.clothing.forEach((ability, index) => {
      if (ability !== "UNKNOWN") {
        const existing = AP[ability] ?? 0
        const toAdd = index === 0 ? 10 : 3
        AP[ability] = existing + toAdd
      }
    })
  }

  if (build.shoes) {
    build.shoes.forEach((ability, index) => {
      if (ability !== "UNKNOWN") {
        const existing = AP[ability] ?? 0
        const toAdd = index === 0 ? 10 : 3
        AP[ability] = existing + toAdd
      }
    })
  }

  return AP
}

export default function useAbilityEffects(build: Partial<Build>) {
  const [explanations, setExplanations] = useState<Explanation[]>([])
  const weaponData: Record<Weapon | SubWeapon | SpecialWeapon, any> = weaponJson

  function calculateISM(amount: number) {
    const ISM = abilityJson["Ink Saver (Main)"]
    const buildWeaponData = weaponData[build.weapon!]
    const inkSaverLvl = buildWeaponData.InkSaverLv as "High" | "Middle" | "Low"

    const keyObj = {
      High: {
        High: "ConsumeRt_Main_High_High",
        Mid: "ConsumeRt_Main_High_Mid",
        Low: "ConsumeRt_Main_High_Low",
      },
      Middle: {
        High: "ConsumeRt_Main_High",
        Mid: "ConsumeRt_Main_Mid",
        Low: "ConsumeRt_Main_Low",
      },
      Low: {
        High: "ConsumeRt_Main_Low_High",
        Mid: "ConsumeRt_Main_Low_Mid",
        Low: "ConsumeRt_Main_Low_Low",
      },
    } as const

    const high = ISM[keyObj[inkSaverLvl].High]
    const mid = ISM[keyObj[inkSaverLvl].Mid]
    const low = ISM[keyObj[inkSaverLvl].Low]
    const highMidLow = [high, mid, low]
    const effect = getEffect(highMidLow, amount)

    const toReturn = []

    const mInkConsume = buildWeaponData.mInkConsume
    if (mInkConsume) {
      const title =
        build.weapon!.includes("Splatling") ||
        build.weapon!.includes("Nautilus")
          ? "Full charges per ink tank"
          : "Shots per ink tank"
      toReturn.push({
        title,
        effect: `${parseFloat((1 / (mInkConsume * effect[0])).toFixed(2))}`,
        effectFromMax: effect[1] * 100,
        ability: "ISM" as Ability,
      })
    }

    const mInkConsumeRepeat = buildWeaponData.mInkConsumeRepeat
    if (mInkConsumeRepeat && mInkConsumeRepeat !== mInkConsume) {
      toReturn.push({
        title: "Shots per ink tank (autofire mode)",
        effect: `${parseFloat(
          (1 / (mInkConsumeRepeat * effect[0])).toFixed(2)
        )}`,
        effectFromMax: effect[1] * 100,
        ability: "ISM" as Ability,
      })
    }

    const mFullChargeInkConsume = buildWeaponData.mFullChargeInkConsume
    if (mFullChargeInkConsume) {
      toReturn.push({
        title: "Fully charged shots per ink tank",
        effect: `${parseFloat(
          (1 / (mFullChargeInkConsume * effect[0])).toFixed(2)
        )}`,
        effectFromMax: effect[1] * 100,
        ability: "ISM" as Ability,
      })
    }

    const mMinChargeInkConsume = buildWeaponData.mMinChargeInkConsume
    if (mMinChargeInkConsume) {
      toReturn.push({
        title: "Tap shots per ink tank",
        effect: `${parseFloat(
          (1 / (mMinChargeInkConsume * effect[0])).toFixed(2)
        )}`,
        effectFromMax: effect[1] * 100,
        ability: "ISM" as Ability,
      })
    }

    const mInkConsumeSplashJump = buildWeaponData.mInkConsumeSplashJump
    const mInkConsumeSplashStand = buildWeaponData.mInkConsumeSplashStand

    if (
      mInkConsumeSplashJump &&
      mInkConsumeSplashJump === mInkConsumeSplashStand
    ) {
      toReturn.push({
        title: "Swings per ink tank",
        effect: `${parseFloat(
          (1 / (mInkConsumeSplashJump * effect[0])).toFixed(2)
        )}`,
        effectFromMax: effect[1] * 100,
        ability: "ISM" as Ability,
      })
    } else if (mInkConsumeSplashJump && mInkConsumeSplashStand) {
      toReturn.push({
        title: "Ground swings per ink tank",
        effect: `${parseFloat(
          (1 / (mInkConsumeSplashStand * effect[0])).toFixed(2)
        )}`,
        effectFromMax: effect[1] * 100,
        ability: "ISM" as Ability,
      })

      toReturn.push({
        title: "Jumping swings per ink tank",
        effect: `${parseFloat(
          (1 / (mInkConsumeSplashJump * effect[0])).toFixed(2)
        )}`,
        effectFromMax: effect[1] * 100,
        ability: "ISM" as Ability,
      })
    }

    const mSideStepInkConsume = buildWeaponData.mSideStepInkConsume
    if (mSideStepInkConsume) {
      toReturn.push({
        title: "Dodge rolls per ink tank",
        effect: `${parseFloat(
          (mSideStepInkConsume * effect[0] * 100).toFixed(2)
        )}% of ink tank`,
        effectFromMax: effect[1] * 100,
        ability: "ISM" as Ability,
      })
    }

    const mInkConsumeUmbrella = buildWeaponData.mInkConsumeUmbrella
    if (mInkConsumeUmbrella) {
      toReturn.push({
        title: "Brella launch ink consumption",
        effect: `${parseFloat(
          (mInkConsumeUmbrella * effect[0] * 100).toFixed(2)
        )}% of ink tank`,
        effectFromMax: effect[1] * 100,
        ability: "ISM" as Ability,
      })
    }

    return toReturn
  }

  function calculateISS(amount: number) {
    const ISS = abilityJson["Ink Saver (Sub)"]
    const buildWeaponData = weaponData[build.weapon!]
    const subWeapon = buildWeaponData.Sub! as SubWeapon

    const subWeaponData = weaponData[subWeapon]
    const inkConsumption = subWeaponData.mInkConsume!

    const letterGrade = weaponData[subWeapon].InkSaverType
    const highKey = `ConsumeRt_Sub_${letterGrade}_High` as keyof typeof ISS
    const midKey = `ConsumeRt_Sub_${letterGrade}_Mid` as keyof typeof ISS
    const lowKey = `ConsumeRt_Sub_${letterGrade}_Low` as keyof typeof ISS

    const high = ISS[highKey]
    const mid = ISS[midKey]
    const low = ISS[lowKey]
    const highMidLow = [high, mid, low]
    const effect = getEffect(highMidLow, amount)
    return [
      {
        title: `${subWeapon} ink consumption`,
        effect: `${parseFloat(
          (effect[0] * inkConsumption * 100).toFixed(2)
        )}% of ink tank`,
        effectFromMax: effect[1] * 100,
        ability: "ISS" as Ability,
      },
    ]
  }

  function calculateREC(amount: number) {
    const REC = abilityJson["Ink Recovery Up"]

    const highKeySquid = "RecoverFullFrm_Ink_High"
    const midKeySquid = "RecoverFullFrm_Ink_Mid"
    const lowKeySquid = "RecoverFullFrm_Ink_Low"
    const highSquid = REC[highKeySquid]
    const midSquid = REC[midKeySquid]
    const lowSquid = REC[lowKeySquid]
    const highMidLowSquid = [highSquid, midSquid, lowSquid]
    const effectSquid = getEffect(highMidLowSquid, amount)

    /*const highKeyHumanoid = "RecoverNrmlFrm_Ink_High"
    const midKeyHumanoid = "RecoverNrmlFrm_Ink_Mid"
    const lowKeyHumanoid = "RecoverNrmlFrm_Ink_Low"
    const highHumanoid = REC[highKeyHumanoid]
    const midHumanoid = REC[midKeyHumanoid]
    const lowHumanoid = REC[lowKeyHumanoid]
    const highMidLowHumanoid = [highHumanoid, midHumanoid, lowHumanoid]
    const effectHumanoid = getEffect(highMidLowHumanoid, amount)*/

    return [
      {
        title: "Ink tank recovery from empty to full (squid form)",
        effect: `${Math.ceil(effectSquid[0])} frames (${parseFloat(
          (effectSquid[0] / 60).toFixed(2)
        )} seconds)`,
        effectFromMax: effectSquid[1] * 100,
        ability: "REC" as Ability,
      },
      /*{
        title: "Ink tank recovery from empty to full (humanoid form)",
        effect: `${Math.ceil(effectHumanoid[0])} frames (${parseFloat(
          (effectHumanoid[0] / 60).toFixed(2)
        )} seconds)`,
        effectFromMax: effectHumanoid[1] * 100,
      },*/
    ]
  }

  function calculateRSU(amount: number) {
    const RSU = abilityJson["Run Speed Up"]

    const buildWeaponData = weaponData[build.weapon!]
    const grade = buildWeaponData.ShotMoveVelType // "A" | "B" | "C" | "D" | "E"
    const moveLv = buildWeaponData.MoveVelLv // "Low" | "Middle" | "High"

    const commonKey =
      moveLv === "Middle"
        ? ""
        : moveLv === "Low"
        ? "_BigWeapon"
        : "_ShortWeapon"
    const highKey = `MoveVel_Human${commonKey}_High` as keyof typeof RSU
    const midKey = `MoveVel_Human${commonKey}_Mid` as keyof typeof RSU
    const lowKey = `MoveVel_Human${commonKey}_Low` as keyof typeof RSU

    const high = RSU[highKey]
    const mid = RSU[midKey]
    const low = RSU[lowKey]
    const highMidLow = [high, mid, low]

    const moveEffect = getEffect(highMidLow, amount)

    const highShootKey = `MoveVelRt_Human_Shot${grade}_High` as keyof typeof RSU
    const midShootKey = `MoveVelRt_Human_Shot${grade}_Mid` as keyof typeof RSU
    const lowShootKey = `MoveVelRt_Human_Shot${grade}_Low` as keyof typeof RSU
    const highShoot = RSU[highShootKey]
    const midShoot = RSU[midShootKey]
    const lowShoot = RSU[lowShootKey]
    const highMidLowShoot = [highShoot, midShoot, lowShoot]

    const shootEffect = getEffect(highMidLowShoot, amount)

    return [
      {
        title: "Run speed",
        effect: `${parseFloat(
          moveEffect[0].toFixed(2)
        )} distance units / frame`,
        effectFromMax: moveEffect[1] * 100,
        ability: "RSU" as Ability,
      },
      {
        title: "Run speed (firing)",
        effect: `${parseFloat(
          (moveEffect[0] * shootEffect[0]).toFixed(2)
        )} distance units / frame`,
        effectFromMax: shootEffect[1] * 100,
        ability: "RSU" as Ability,
      },
    ]
  }

  function calculateSSU(amount: number) {
    const SSU = abilityJson["Swim Speed Up"]

    const buildWeaponData = weaponData[build.weapon!]
    const moveLv = buildWeaponData.MoveVelLv // "Low" | "Middle" | "High"

    const commonKey =
      moveLv === "Middle"
        ? ""
        : moveLv === "Low"
        ? "_BigWeapon"
        : "_ShortWeapon"
    const highKey = `MoveVel_Stealth${commonKey}_High` as keyof typeof SSU
    const midKey = `MoveVel_Stealth${commonKey}_Mid` as keyof typeof SSU
    const lowKey = `MoveVel_Stealth${commonKey}_Low` as keyof typeof SSU

    const high = SSU[highKey]
    const mid = SSU[midKey]
    const low = SSU[lowKey]
    const highMidLow = [high, mid, low]

    const effect = getEffect(highMidLow, amount)

    return [
      {
        title: "Swim speed",
        effect: `${parseFloat(effect[0].toFixed(2))} distance units / frame`,
        effectFromMax: effect[1] * 100,
        ability: "SSU" as Ability,
      },
    ]
  }

  function calculateSCU(amount: number) {
    const SCU = abilityJson["Special Charge Up"]

    const buildWeaponData = weaponData[build.weapon!]
    const points = buildWeaponData.SpecialCost!

    const high = SCU.SpecialRt_Charge_High
    const mid = SCU.SpecialRt_Charge_Mid
    const low = SCU.SpecialRt_Charge_Low
    const highMidLow = [high, mid, low]

    const effect = getEffect(highMidLow, amount)

    return [
      {
        title: "Special charge speed",
        effect: `${parseFloat((effect[0] * 100).toFixed(2))}% (${Math.ceil(
          points / effect[0]
        )}p)`,
        effectFromMax: effect[1] * 100,
        ability: "SCU" as Ability,
      },
    ]
  }

  function calculateSS(amount: number) {
    const SS = abilityJson["Special Saver"]

    const high = SS.SpecialRt_Restart_High
    const mid = SS.SpecialRt_Restart_Mid
    const low = SS.SpecialRt_Restart_Low
    const highMidLow = [high, mid, low]

    const effect = getEffect(highMidLow, amount)

    const toReturn = []

    toReturn.push({
      title: "Special lost when killed",
      effect: `${parseFloat(
        ((1.0 - effect[0]) * 100).toFixed(2)
      )}% of the charge`,
      effectFromMax: effect[1] * 100,
      ability: "SS" as Ability,
    })

    if (weaponData[build.weapon!].Special === "Splashdown") {
      const high = SS.SpecialRt_Restart_SuperLanding_High
      const mid = SS.SpecialRt_Restart_SuperLanding_Mid
      const low = SS.SpecialRt_Restart_SuperLanding_Low
      const highMidLow = [high, mid, low]

      const effect = getEffect(highMidLow, amount)

      const lost = effect[0] > 1 ? 1 : effect[0]
      const effectAtZero = getEffect(highMidLow, 0)
      const fromMax = (lost - effectAtZero[0]) / 0.25

      toReturn.push({
        title: "Special lost when killed mid-Splashdown",
        effect: `${parseFloat(((1.0 - lost) * 100).toFixed(2))}% of the charge`,
        effectFromMax: fromMax * 100,
        ability: "SS" as Ability,
      })
    }

    return toReturn
  }

  function calculateSPU(amount: number) {
    const buildWeaponData = weaponData[build.weapon!]
    const specialWeapon = buildWeaponData.Special! as SpecialWeapon
    const specialWeaponData = weaponData[specialWeapon]

    const toReturn = []

    if (
      specialWeaponData.mPaintGauge_SpecialFrm &&
      specialWeaponData.mPaintGauge_SpecialFrmM &&
      specialWeaponData.mPaintGauge_SpecialFrmH
    ) {
      const high = specialWeaponData.mPaintGauge_SpecialFrmH
      const mid = specialWeaponData.mPaintGauge_SpecialFrmM
      const low = specialWeaponData.mPaintGauge_SpecialFrm
      const highMidLow = [high, mid, low]

      const effect = getEffect(highMidLow, amount)
      toReturn.push({
        title: `${specialWeapon} duration`,
        effect: `${Math.ceil(effect[0])} frames (${parseFloat(
          (effect[0] / 60).toFixed(2)
        )} seconds)`,
        effectFromMax: effect[1] * 100,
        ability: "SPU" as Ability,
        info:
          specialWeapon === "Inkjet"
            ? "Special Power Up also increases Ink Jet's shots' painting and blast radius"
            : undefined,
      })
    }

    if (specialWeapon === "Tenta Missiles") {
      const high = specialWeaponData.mTargetInCircleRadiusHigh
      const mid = specialWeaponData.mTargetInCircleRadiusMid
      const low = specialWeaponData.mTargetInCircleRadius
      const highMidLow = [high, mid, low]

      const effect = getEffect(highMidLow, amount)
      const effectAtZero = getEffect(highMidLow, 0)

      const highPaint = specialWeaponData.mBurst_PaintRHigh
      const midPaint = specialWeaponData.mBurst_PaintRMid
      const lowPaint = specialWeaponData.mBurst_PaintR
      const highMidLowPaint = [highPaint, midPaint, lowPaint]

      const effectPaint = getEffect(highMidLowPaint, amount)
      const effectPaintAtZero = getEffect(highMidLowPaint, 0)
      toReturn.push({
        title: "Tenta Missiles reticle size",
        effect: `${parseFloat(
          ((effect[0] / effectAtZero[0]) * 100).toFixed(2)
        )}%`,
        effectFromMax: effect[1] * 100,
        ability: "SPU" as Ability,
      })
      toReturn.push({
        title: "Tenta Missiles ink coverage",
        effect: `${parseFloat(
          ((effectPaint[0] / effectPaintAtZero[0]) * 100).toFixed(2)
        )}%`,
        effectFromMax: effectPaint[1] * 100,
        ability: "SPU" as Ability,
      })
    }

    if (specialWeapon === "Splashdown") {
      const highNear = specialWeaponData.mBurst_Radius_Near_H
      const lowNear = specialWeaponData.mBurst_Radius_Near
      const midNear = (highNear + lowNear) / 2
      const highMidLowNear = [highNear, midNear, lowNear]

      const effectNear = getEffect(highMidLowNear, amount)
      const effectAtZeroNear = getEffect(highMidLowNear, 0)

      const highMiddle = specialWeaponData.mBurst_Radius_Middle_H
      const lowMiddle = specialWeaponData.mBurst_Radius_Middle
      const midMiddle = (highMiddle + lowMiddle) / 2
      const highMidLowMiddle = [highMiddle, midMiddle, lowMiddle]

      const effectMiddle = getEffect(highMidLowMiddle, amount)
      const effectAtZeroMiddle = getEffect(highMidLowMiddle, 0)
      toReturn.push({
        title: "Splashdown 180dmg hitbox size",
        effect: `${parseFloat(
          ((effectNear[0] / effectAtZeroNear[0]) * 100).toFixed(2)
        )}%`,
        effectFromMax: effectNear[1] * 100,
        ability: "SPU" as Ability,
      })
      toReturn.push({
        title: "Splashdown 70dmg hitbox size",
        effect: `${parseFloat(
          ((effectMiddle[0] / effectAtZeroMiddle[0]) * 100).toFixed(2)
        )}%`,
        effectFromMax: effectMiddle[1] * 100,
        ability: "SPU" as Ability,
        info:
          "55dmg hitbox can't be increased with Special Power Up so the total radius of the special doesn't change",
      })
    }

    if (specialWeapon === "Ink Armor") {
      const high = specialWeaponData.mEnergyAbsorbFrmH
      const mid = specialWeaponData.mEnergyAbsorbFrmM
      const low = specialWeaponData.mEnergyAbsorbFrm
      const highMidLow = [high, mid, low]

      const effect = getEffect(highMidLow, amount)
      toReturn.push({
        title: `Ink Armor activation time`,
        effect: `${Math.ceil(effect[0])} frames (${parseFloat(
          (effect[0] / 60).toFixed(2)
        )} seconds)`,
        effectFromMax: effect[1] * 100,
        ability: "SPU" as Ability,
      })
    }

    if (specialWeapon === "Ink Storm") {
      const high = specialWeaponData.mRainAreaFrameHigh
      const mid = specialWeaponData.mRainAreaFrameMid
      const low = specialWeaponData.mRainAreaFrame
      const highMidLow = [high, mid, low]

      const effect = getEffect(highMidLow, amount)
      toReturn.push({
        title: `Ink Storm duration`,
        effect: `${Math.ceil(effect[0])} frames (${parseFloat(
          (effect[0] / 60).toFixed(2)
        )} seconds)`,
        effectFromMax: effect[1] * 100,
        ability: "SPU" as Ability,
        info:
          "Amount inked by Ink Storm is not increased only in how long distance the droplets are spread",
      })
    }

    if (specialWeapon === "Baller") {
      const high = specialWeaponData.mHP_High
      const mid = specialWeaponData.mHP_Mid
      const low = specialWeaponData.mHP_Low
      const highMidLow = [high, mid, low]

      const effect = getEffect(highMidLow, amount)
      const effectAtZero = getEffect(highMidLow, 0)
      toReturn.push({
        title: `Baller durability`,
        effect: `${parseFloat(
          ((effect[0] / effectAtZero[0]) * 100).toFixed(2)
        )}%`,
        effectFromMax: effect[1] * 100,
        ability: "SPU" as Ability,
      })

      const highHit = specialWeaponData.mBurst_Radius_FarHigh
      const midHit = specialWeaponData.mBurst_Radius_FarMid
      const lowHit = specialWeaponData.mBurst_Radius_Far
      const highMidLowHit = [highHit, midHit, lowHit]

      const effectHit = getEffect(highMidLowHit, amount)
      const effectAtZeroHit = getEffect(highMidLowHit, 0)
      toReturn.push({
        title: `Baller 55dmg explosion hitbox size`,
        effect: `${parseFloat(
          ((effectHit[0] / effectAtZeroHit[0]) * 100).toFixed(2)
        )}%`,
        effectFromMax: effectHit[1] * 100,
        ability: "SPU" as Ability,
      })
    }

    if (specialWeapon === "Bubble Blower") {
      const highSize = specialWeaponData.mBombCoreRadiusRateHigh
      const midSize = specialWeaponData.mBombCoreRadiusRateMid
      const lowSize = 1.0
      const highMidLowSize = [highSize, midSize, lowSize]

      const effectSize = getEffect(highMidLowSize, amount)
      const effectAtZeroSize = getEffect(highMidLowSize, 0)
      toReturn.push({
        title: `Bubble Blower bubble size`,
        effect: `${parseFloat(
          ((effectSize[0] / effectAtZeroSize[0]) * 100).toFixed(2)
        )}%`,
        effectFromMax: effectSize[1] * 100,
        ability: "SPU" as Ability,
      })

      const highHit = specialWeaponData.mCollisionPlayerRadiusMaxHigh
      const midHit = specialWeaponData.mCollisionPlayerRadiusMaxMid
      const lowHit = specialWeaponData.mCollisionPlayerRadiusMax
      const highMidLowHit = [highHit, midHit, lowHit]

      const effectHit = getEffect(highMidLowHit, amount)
      const effectAtZeroHit = getEffect(highMidLowHit, 0)
      toReturn.push({
        title: `Bubble Blower explosion hitbox`,
        effect: `${parseFloat(
          ((effectHit[0] / effectAtZeroHit[0]) * 100).toFixed(2)
        )}%`,
        effectFromMax: effectHit[1] * 100,
        ability: "SPU" as Ability,
      })
    }

    if (specialWeapon === "Booyah Bomb") {
      const high = specialWeaponData.mChargeRtAutoIncr_High
      const mid = specialWeaponData.mChargeRtAutoIncr_Mid
      const low = specialWeaponData.mChargeRtAutoIncr_Low
      const highMidLow = [high, mid, low]

      const effect = getEffect(highMidLow, amount)
      const effectAtZero = getEffect(highMidLow, 0)
      toReturn.push({
        title: `Booyah Bomb autocharge speed`,
        effect: `${parseFloat(
          ((effect[0] / effectAtZero[0]) * 100).toFixed(2)
        )}%`,
        effectFromMax: effect[1] * 100,
        ability: "SPU" as Ability,
      })
    }

    return toReturn
  }

  function calculateQR(amount: number) {
    const QR = abilityJson["Quick Respawn"]

    const highAround = QR.Dying_AroudFrm_High
    const midAround = QR.Dying_AroudFrm_Mid
    const lowAround = QR.Dying_AroudFrm_Low
    const highMidLowAround = [highAround, midAround, lowAround]
    const effectAround = getEffect(highMidLowAround, amount)

    const highChase = QR.Dying_ChaseFrm_High
    const midChase = QR.Dying_ChaseFrm_Mid
    const lowChase = QR.Dying_ChaseFrm_Low
    const highMidLowChase = [highChase, midChase, lowChase]
    const effectChase = getEffect(highMidLowChase, amount)

    const totalFrames = Math.ceil(150 + effectAround[0] + effectChase[0])

    return [
      {
        title: "Quick Respawn time",
        effect: `${totalFrames} frames (${parseFloat(
          (totalFrames / 60).toFixed(2)
        )} seconds)`,
        effectFromMax: effectAround[1] * 100,
        ability: "QR" as Ability,
        info:
          "Quick Respawn activates when enemy kills you twice without you getting a kill in between",
      },
    ]
  }

  const abilityFunctions: Partial<Record<
    string,
    (amount: number) => Explanation[]
  >> = {
    ISM: calculateISM,
    ISS: calculateISS,
    REC: calculateREC,
    RSU: calculateRSU,
    SSU: calculateSSU,
    SCU: calculateSCU,
    SS: calculateSS,
    SPU: calculateSPU,
    QR: calculateQR,
  } as const

  useEffect(() => {
    if (!build.weapon) return
    const AP = buildToAP(build)

    let newExplanations: Explanation[] = []
    Object.keys(abilityFunctions).forEach((ability) => {
      const func = abilityFunctions[ability]
      const abilityForFunc = ability as Ability
      const explanations = func!(AP[abilityForFunc] ?? 0)
      newExplanations = [...newExplanations, ...explanations]
    })

    setExplanations(newExplanations)
  }, [build])

  return explanations
}
