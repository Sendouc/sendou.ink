import { Build, Ability, Weapon, SubWeapon, SpecialWeapon } from "../types"
import { useEffect, useState } from "react"
import { getEffect } from "../utils/getAbilityEffect"
import weaponJson from "../utils/weapon_data.json"
import abilityJson from "../utils/ability_data.json"

export interface Explanation {
  title: string
  effect: string
  effectFromMax: number
  effectFromMaxActual?: number
  ability: Ability
  info?: string
  getEffect?: (ap: number) => number
  ap: number
}

const MAX_AP = 57

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
        effectFromMax: effect[1],
        effectFromMaxActual:
          (getEffect(highMidLow, MAX_AP)[0] / effect[0]) * 100,
        ability: "ISM" as Ability,
        getEffect: (ap: number) =>
          parseFloat(
            (1 / (mInkConsume * getEffect(highMidLow, ap)[0])).toFixed(2)
          ),
        ap: amount,
      })
    }

    const mInkConsumeRepeat = buildWeaponData.mInkConsumeRepeat
    if (mInkConsumeRepeat && mInkConsumeRepeat !== mInkConsume) {
      toReturn.push({
        title: "Shots per ink tank (autofire mode)",
        effect: `${parseFloat(
          (1 / (mInkConsumeRepeat * effect[0])).toFixed(2)
        )}`,
        effectFromMax: effect[1],
        effectFromMaxActual:
          (getEffect(highMidLow, MAX_AP)[0] / effect[0]) * 100,
        ability: "ISM" as Ability,
        getEffect: (ap: number) =>
          parseFloat(
            (1 / (mInkConsumeRepeat * getEffect(highMidLow, ap)[0])).toFixed(2)
          ),
        ap: amount,
      })
    }

    const mFullChargeInkConsume = buildWeaponData.mFullChargeInkConsume
    if (mFullChargeInkConsume) {
      toReturn.push({
        title: "Fully charged shots per ink tank",
        effect: `${parseFloat(
          (1 / (mFullChargeInkConsume * effect[0])).toFixed(2)
        )}`,
        effectFromMax: effect[1],
        effectFromMaxActual:
          (getEffect(highMidLow, MAX_AP)[0] / effect[0]) * 100,
        ability: "ISM" as Ability,
        getEffect: (ap: number) =>
          parseFloat(
            (
              1 /
              (mFullChargeInkConsume * getEffect(highMidLow, ap)[0])
            ).toFixed(2)
          ),
        ap: amount,
      })
    }

    const mMinChargeInkConsume = buildWeaponData.mMinChargeInkConsume
    if (mMinChargeInkConsume) {
      toReturn.push({
        title: "Tap shots per ink tank",
        effect: `${parseFloat(
          (1 / (mMinChargeInkConsume * effect[0])).toFixed(2)
        )}`,
        effectFromMax: effect[1],
        effectFromMaxActual:
          (getEffect(highMidLow, MAX_AP)[0] / effect[0]) * 100,
        ability: "ISM" as Ability,
        getEffect: (ap: number) =>
          parseFloat(
            (1 / (mMinChargeInkConsume * getEffect(highMidLow, ap)[0])).toFixed(
              2
            )
          ),
        ap: amount,
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
        effectFromMax: effect[1],
        effectFromMaxActual:
          (getEffect(highMidLow, MAX_AP)[0] / effect[0]) * 100,
        ability: "ISM" as Ability,
        getEffect: (ap: number) =>
          parseFloat(
            (
              1 /
              (mInkConsumeSplashJump * getEffect(highMidLow, ap)[0])
            ).toFixed(2)
          ),
        ap: amount,
      })
    } else if (mInkConsumeSplashJump && mInkConsumeSplashStand) {
      toReturn.push({
        title: "Ground swings per ink tank",
        effect: `${parseFloat(
          (1 / (mInkConsumeSplashStand * effect[0])).toFixed(2)
        )}`,
        effectFromMax: effect[1],
        effectFromMaxActual:
          (getEffect(highMidLow, MAX_AP)[0] / effect[0]) * 100,
        ability: "ISM" as Ability,
        getEffect: (ap: number) =>
          parseFloat(
            (
              1 /
              (mInkConsumeSplashStand * getEffect(highMidLow, ap)[0])
            ).toFixed(2)
          ),
        ap: amount,
      })

      toReturn.push({
        title: "Jumping swings per ink tank",
        effect: `${parseFloat(
          (1 / (mInkConsumeSplashJump * effect[0])).toFixed(2)
        )}`,
        effectFromMax: effect[1],
        effectFromMaxActual:
          (getEffect(highMidLow, MAX_AP)[0] / effect[0]) * 100,
        ability: "ISM" as Ability,
        getEffect: (ap: number) =>
          parseFloat(
            (
              1 /
              (mInkConsumeSplashJump * getEffect(highMidLow, ap)[0])
            ).toFixed(2)
          ),
        ap: amount,
      })
    }

    const mSideStepInkConsume = buildWeaponData.mSideStepInkConsume
    if (mSideStepInkConsume) {
      toReturn.push({
        title: "Dodge roll ink consumption",
        effect: `${parseFloat(
          (mSideStepInkConsume * effect[0] * 100).toFixed(2)
        )}% of ink tank`,
        effectFromMax: effect[1],
        effectFromMaxActual: parseFloat(
          (mSideStepInkConsume * effect[0] * 100).toFixed(2)
        ),
        ability: "ISM" as Ability,
        getEffect: (ap: number) =>
          parseFloat(
            (mSideStepInkConsume * getEffect(highMidLow, ap)[0] * 100).toFixed(
              2
            )
          ),
        ap: amount,
      })
    }

    const mInkConsumeUmbrella = buildWeaponData.mInkConsumeUmbrella
    if (mInkConsumeUmbrella) {
      toReturn.push({
        title: "Brella shield launch ink consumption",
        effect: `${parseFloat(
          (mInkConsumeUmbrella * effect[0] * 100).toFixed(2)
        )}% of ink tank`,
        effectFromMax: effect[1],
        effectFromMaxActual: parseFloat(
          (mInkConsumeUmbrella * effect[0] * 100).toFixed(2)
        ),
        ability: "ISM" as Ability,
        getEffect: (ap: number) =>
          parseFloat(
            (mInkConsumeUmbrella * getEffect(highMidLow, ap)[0] * 100).toFixed(
              2
            )
          ),
        ap: amount,
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
        effectFromMax: effect[1],
        effectFromMaxActual: parseFloat(
          (effect[0] * inkConsumption * 100).toFixed(2)
        ),
        ability: "ISS" as Ability,
        ap: amount,
        getEffect: (ap: number) =>
          parseFloat(
            (inkConsumption * getEffect(highMidLow, ap)[0] * 100).toFixed(2)
          ),
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
          (Math.ceil(effectSquid[0]) / 60).toFixed(2)
        )} seconds)`,
        effectFromMax: effectSquid[1],
        effectFromMaxActual:
          (effectSquid[0] / getEffect(highMidLowSquid, 0)[0]) * 100,
        ability: "REC" as Ability,
        ap: amount,
        getEffect: (ap: number) => Math.ceil(getEffect(highMidLowSquid, ap)[0]),
      },
      /*{
        title: "Ink tank recovery from empty to full (humanoid form)",
        effect: `${Math.ceil(effectHumanoid[0])} frames (${parseFloat(
          (effectHumanoid[0] / 60).toFixed(2)
        )} seconds)`,
        effectFromMax: effectHumanoid[1],
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
        effectFromMax: moveEffect[1],
        effectFromMaxActual: (moveEffect[0] / 2.4) * 100,
        ability: "RSU" as Ability,
        ap: amount,
        getEffect: (ap: number) =>
          parseFloat(getEffect(highMidLow, ap)[0].toFixed(4)),
      },
      {
        title: "Run speed (firing)",
        effect: `${parseFloat(
          (moveEffect[0] * shootEffect[0]).toFixed(2)
        )} distance units / frame`,
        effectFromMax: shootEffect[1],
        effectFromMaxActual: ((moveEffect[0] * shootEffect[0]) / 2.4) * 100,
        ability: "RSU" as Ability,
        ap: amount,
        getEffect: (ap: number) =>
          parseFloat(
            (
              getEffect(highMidLow, ap)[0] * getEffect(highMidLowShoot, ap)[0]
            ).toFixed(4)
          ),
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
        effectFromMax: effect[1],
        effectFromMaxActual: (effect[0] / 2.4) * 100,
        ability: "SSU" as Ability,
        ap: amount,
        getEffect: (ap: number) => getEffect(highMidLow, ap)[0],
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
        title: "Points to special",
        effect: `${Math.ceil(points / effect[0])}p (${parseFloat(
          (effect[0] * 100).toFixed(2)
        )}% speed)`,
        effectFromMax: effect[1],
        effectFromMaxActual: (getEffect(highMidLow, 0)[0] / effect[0]) * 100,
        ability: "SCU" as Ability,
        ap: amount,
        getEffect: (ap: number) =>
          Math.ceil(points / getEffect(highMidLow, ap)[0]),
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
      effectFromMax: effect[1],
      effectFromMaxActual: (1.0 - effect[0]) * 100,
      ability: "SS" as Ability,
      ap: amount,
      getEffect: (ap: number) =>
        parseFloat(((1.0 - getEffect(highMidLow, ap)[0]) * 100).toFixed(2)),
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
        effectFromMax: fromMax,
        effectFromMaxActual: parseFloat(((1.0 - lost) * 100).toFixed(2)),
        ability: "SS" as Ability,
        ap: amount,
        getEffect: (ap: number) =>
          Math.max(
            0,
            parseFloat(((1.0 - getEffect(highMidLow, ap)[0]) * 100).toFixed(2))
          ),
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
          (Math.ceil(effect[0]) / 60).toFixed(2)
        )} seconds)`,
        effectFromMax: effect[1],
        effectFromMaxActual:
          (effect[0] / getEffect(highMidLow, MAX_AP)[0]) * 100,
        ability: "SPU" as Ability,
        info:
          specialWeapon === "Inkjet"
            ? "Special Power Up also increases Ink Jet's shots' painting and blast radius"
            : undefined,
        ap: amount,
        getEffect: (ap: number) => Math.ceil(getEffect(highMidLow, ap)[0]),
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
        effectFromMax: effect[1],
        effectFromMaxActual:
          (effect[0] / getEffect(highMidLow, MAX_AP)[0]) * 100,
        ability: "SPU" as Ability,
        ap: amount,
        getEffect: (ap: number) =>
          parseFloat(
            ((getEffect(highMidLow, ap)[0] / effectAtZero[0]) * 100).toFixed(3)
          ),
      })
      toReturn.push({
        title: "Tenta Missiles ink coverage",
        effect: `${parseFloat(
          ((effectPaint[0] / effectPaintAtZero[0]) * 100).toFixed(2)
        )}%`,
        effectFromMax: effectPaint[1],
        effectFromMaxActual:
          (effectPaint[0] / getEffect(highMidLowPaint, MAX_AP)[0]) * 100,
        ability: "SPU" as Ability,
        ap: amount,
        getEffect: (ap: number) =>
          parseFloat(
            (
              (getEffect(highMidLowPaint, ap)[0] / effectPaintAtZero[0]) *
              100
            ).toFixed(3)
          ),
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
        effectFromMax: effectNear[1],
        effectFromMaxActual:
          (effectNear[0] / getEffect(highMidLowNear, MAX_AP)[0]) * 100,
        ability: "SPU" as Ability,
        ap: amount,
        getEffect: (ap: number) =>
          parseFloat(
            (
              (getEffect(highMidLowNear, ap)[0] / effectAtZeroNear[0]) *
              100
            ).toFixed(3)
          ),
      })
      toReturn.push({
        title: "Splashdown 70dmg hitbox size",
        effect: `${parseFloat(
          ((effectMiddle[0] / effectAtZeroMiddle[0]) * 100).toFixed(2)
        )}%`,
        effectFromMax: effectMiddle[1],
        effectFromMaxActual:
          (effectMiddle[0] / getEffect(highMidLowMiddle, MAX_AP)[0]) * 100,
        ability: "SPU" as Ability,
        info:
          "55dmg hitbox can't be increased with Special Power Up so the total radius of the special doesn't change",
        ap: amount,
        getEffect: (ap: number) =>
          parseFloat(
            (
              (getEffect(highMidLowMiddle, ap)[0] / effectAtZeroMiddle[0]) *
              100
            ).toFixed(3)
          ),
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
          (Math.ceil(effect[0]) / 60).toFixed(2)
        )} seconds)`,
        effectFromMax: effect[1],
        ability: "SPU" as Ability,
        ap: amount,
        effectFromMaxActual: (effect[0] / getEffect(highMidLow, 0)[0]) * 100,
        getEffect: (ap: number) => Math.ceil(getEffect(highMidLow, ap)[0]),
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
          (Math.ceil(effect[0]) / 60).toFixed(2)
        )} seconds)`,
        effectFromMax: effect[1],
        ability: "SPU" as Ability,
        info:
          "Amount inked by Ink Storm is not increased only in how long distance the droplets are spread. Special Power Up also increases the distance you can throw the seed.",
        ap: amount,
        effectFromMaxActual:
          (effect[0] / getEffect(highMidLow, MAX_AP)[0]) * 100,
        getEffect: (ap: number) => Math.ceil(getEffect(highMidLow, ap)[0]),
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
        effectFromMax: effect[1],
        effectFromMaxActual:
          (effect[0] / getEffect(highMidLow, MAX_AP)[0]) * 100,
        ability: "SPU" as Ability,
        ap: amount,
        getEffect: (ap: number) =>
          parseFloat(
            ((getEffect(highMidLow, ap)[0] / effectAtZero[0]) * 100).toFixed(3)
          ),
      })

      const highHit = specialWeaponData.mBurst_Radius_MiddleHigh
      const midHit = specialWeaponData.mBurst_Radius_MiddleMid
      const lowHit = specialWeaponData.mBurst_Radius_Middle
      const highMidLowHit = [highHit, midHit, lowHit]

      const effectHit = getEffect(highMidLowHit, amount)
      const effectAtZeroHit = getEffect(highMidLowHit, 0)
      console.log("effectHit", effectHit)

      toReturn.push({
        title: `Baller 55dmg explosion hitbox size`,
        effect: `${parseFloat(
          ((effectHit[0] / effectAtZeroHit[0]) * 100).toFixed(2)
        )}%`,
        effectFromMax: effectHit[1],
        effectFromMaxActual:
          (effectHit[0] / getEffect(highMidLowHit, MAX_AP)[0]) * 100,
        ability: "SPU" as Ability,
        ap: amount,
        getEffect: (ap: number) =>
          parseFloat(
            (
              (getEffect(highMidLowHit, ap)[0] / effectAtZeroHit[0]) *
              100
            ).toFixed(3)
          ),
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
        effectFromMax: effectSize[1],
        effectFromMaxActual:
          (effectSize[0] / getEffect(highMidLowSize, MAX_AP)[0]) * 100,
        ability: "SPU" as Ability,
        ap: amount,
        getEffect: (ap: number) =>
          parseFloat(
            (
              (getEffect(highMidLowSize, ap)[0] / effectAtZeroSize[0]) *
              100
            ).toFixed(3)
          ),
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
        effectFromMax: effectHit[1],
        effectFromMaxActual:
          (effectHit[0] / getEffect(highMidLowHit, MAX_AP)[0]) * 100,
        ability: "SPU" as Ability,
        ap: amount,
        getEffect: (ap: number) =>
          parseFloat(
            (
              (getEffect(highMidLowHit, ap)[0] / effectAtZeroHit[0]) *
              100
            ).toFixed(3)
          ),
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
        effectFromMax: effect[1],
        effectFromMaxActual:
          (effect[0] / getEffect(highMidLow, MAX_AP)[0]) * 100,
        ability: "SPU" as Ability,
        ap: amount,
        getEffect: (ap: number) =>
          parseFloat(
            ((getEffect(highMidLow, ap)[0] / effectAtZero[0]) * 100).toFixed(3)
          ),
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

    const effectAtZero = Math.ceil(
      150 + getEffect(highMidLowAround, 0)[0] + getEffect(highMidLowChase, 0)[0]
    )

    return [
      {
        title: "Quick Respawn time",
        effect: `${totalFrames} frames (${parseFloat(
          (totalFrames / 60).toFixed(2)
        )} seconds)`,
        effectFromMax: effectAround[1],
        effectFromMaxActual: (totalFrames / effectAtZero) * 100,
        ability: "QR" as Ability,
        info:
          "Quick Respawn activates when enemy kills you twice without you getting a kill in between",
        ap: amount,
        getEffect: (ap: number) =>
          Math.ceil(
            150 +
              getEffect(highMidLowChase, ap)[0] +
              getEffect(highMidLowAround, ap)[0]
          ),
      },
    ]
  }

  function calculateQSJ(amount: number) {
    const QSJ = abilityJson["Quick Super Jump"]

    const highTame = QSJ.DokanWarp_TameFrm_High
    const midTame = QSJ.DokanWarp_TameFrm_Mid
    const lowTame = QSJ.DokanWarp_TameFrm_Low
    const highMidLowTame = [highTame, midTame, lowTame]
    const effectTame = getEffect(highMidLowTame, amount)

    const highMove = QSJ.DokanWarp_MoveFrm_High
    const midMove = QSJ.DokanWarp_MoveFrm_Mid
    const lowMove = QSJ.DokanWarp_MoveFrm_Low
    const highMidLowMove = [highMove, midMove, lowMove]
    const effectMove = getEffect(highMidLowMove, amount)

    return [
      {
        title: "Quick Super Jump time (on the ground)",
        effect: `${Math.ceil(effectTame[0])} frames (${parseFloat(
          (Math.ceil(effectTame[0]) / 60).toFixed(2)
        )} seconds)`,
        effectFromMax: effectTame[1],
        effectFromMaxActual:
          (effectTame[0] / getEffect(highMidLowTame, 0)[0]) * 100,
        ability: "QSJ" as Ability,
        ap: amount,
        getEffect: (ap: number) => Math.ceil(getEffect(highMidLowTame, ap)[0]),
      },
      {
        title: "Quick Super Jump time (in the air)",
        effect: `${Math.ceil(effectMove[0])} frames (${parseFloat(
          (Math.ceil(effectMove[0]) / 60).toFixed(2)
        )} seconds)`,
        effectFromMax: effectMove[1],
        ability: "QSJ" as Ability,
        ap: amount,
        effectFromMaxActual:
          (effectMove[0] / getEffect(highMidLowMove, 0)[0]) * 100,
        getEffect: (ap: number) => Math.ceil(getEffect(highMidLowMove, ap)[0]),
      },
    ]
  }

  function calculateBRU(amount: number) {
    const BRU = abilityJson["Sub Power Up"]
    const buildWeaponData = weaponData[build.weapon!]
    const subWeapon = buildWeaponData.Sub! as SubWeapon
    const subWeaponData = weaponData[subWeapon]

    const toReturn = []

    if (
      [
        "Splat Bomb",
        "Suction Bomb",
        "Burst Bomb",
        "Curling Bomb",
        "Autobomb",
        "Toxic Mist",
        "Fizzy Bomb",
        "Torpedo",
        "Point Sensor",
      ].includes(subWeapon)
    ) {
      let baseKey = "BombThrow_VelZ"
      if (subWeapon === "Torpedo") baseKey = "BombThrow_VelZ_BombTako"
      if (subWeapon === "Fizzy Bomb") baseKey = "BombThrow_VelZ_BombPiyo"
      if (subWeapon === "Point Sensor") baseKey = "BombThrow_VelZ_PointSensor"
      const highKey = `${baseKey}_High` as keyof typeof BRU
      const midKey = `${baseKey}_Mid` as keyof typeof BRU
      const lowKey = `${baseKey}_Low` as keyof typeof BRU
      const highVelo = BRU[highKey]
      const midVelo = BRU[midKey]
      const lowVelo = BRU[lowKey]
      const highMidLowVelo = [highVelo, midVelo, lowVelo]
      const effectVelo = getEffect(highMidLowVelo, amount)
      const effectVeloAtZero = getEffect(highMidLowVelo, 0)

      toReturn.push({
        title: `${subWeapon} velocity and range`,
        effect: `${parseFloat(
          ((effectVelo[0] / effectVeloAtZero[0]) * 100).toFixed(2)
        )}% (${parseFloat(effectVelo[0].toFixed(2))})`,
        effectFromMax: effectVelo[1],
        effectFromMaxActual:
          (effectVelo[0] / getEffect(highMidLowVelo, MAX_AP)[0]) * 100,
        ability: "BRU" as Ability,
        ap: amount,
        getEffect: (ap: number) =>
          parseFloat(getEffect(highMidLowVelo, ap)[0].toFixed(2)),
      })
    }

    if (subWeapon === "Sprinkler") {
      const highFirst = subWeaponData.mPeriod_FirstHigh
      const midFirst = subWeaponData.mPeriod_FirstMid
      const lowFirst = subWeaponData.mPeriod_First
      const highMidLowFirst = [highFirst, midFirst, lowFirst]
      const effectFirst = getEffect(highMidLowFirst, amount)

      toReturn.push({
        title: "Sprinkler full-power phase duration",
        effect: `${Math.ceil(effectFirst[0])} frames (${parseFloat(
          (Math.ceil(effectFirst[0]) / 60).toFixed(2)
        )} seconds)`,
        effectFromMax: effectFirst[1],
        ability: "BRU" as Ability,
        ap: amount,
        effectFromMaxActual:
          (effectFirst[0] / getEffect(highMidLowFirst, MAX_AP)[0]) * 100,
        getEffect: (ap: number) => Math.ceil(getEffect(highMidLowFirst, ap)[0]),
      })

      const highSecond = subWeaponData.mPeriod_SecondHigh
      const midSecond = subWeaponData.mPeriod_SecondMid
      const lowSecond = subWeaponData.mPeriod_Second
      const highMidLowSecond = [highSecond, midSecond, lowSecond]
      const effectSecond = getEffect(highMidLowSecond, amount)

      toReturn.push({
        title: "Sprinkler mid-phase duration",
        effect: `${Math.ceil(effectSecond[0])} frames (${parseFloat(
          (Math.ceil(effectSecond[0]) / 60).toFixed(2)
        )} seconds)`,
        effectFromMax: effectSecond[1],
        ability: "BRU" as Ability,
        ap: amount,
        effectFromMaxActual:
          (effectSecond[0] / getEffect(highMidLowSecond, MAX_AP)[0]) * 100,
        getEffect: (ap: number) =>
          Math.ceil(getEffect(highMidLowSecond, ap)[0]),
      })
    }

    if (["Point Sensor", "Ink Mine"].includes(subWeapon)) {
      const high = subWeaponData.mMarkingFrameHigh
      const mid = subWeaponData.mMarkingFrameMid
      const low = subWeaponData.mMarkingFrame
      const highMidLow = [high, mid, low]
      const effect = getEffect(highMidLow, amount)

      toReturn.push({
        title: `${subWeapon} tracking duration`,
        effect: `${Math.ceil(effect[0])} frames (${parseFloat(
          (Math.ceil(effect[0]) / 60).toFixed(2)
        )} seconds)`,
        effectFromMax: effect[1],
        ability: "BRU" as Ability,
        ap: amount,
        effectFromMaxActual:
          (effect[0] / getEffect(highMidLow, MAX_AP)[0]) * 100,
        getEffect: (ap: number) => Math.ceil(getEffect(highMidLow, ap)[0]),
      })
    }

    if (subWeapon === "Ink Mine") {
      const high = subWeaponData.mPlayerColRadiusHigh
      const mid = subWeaponData.mPlayerColRadiusMid
      const low = subWeaponData.mPlayerColRadius
      const highMidLow = [high, mid, low]
      const effect = getEffect(highMidLow, amount)
      const effectAtZero = getEffect(highMidLow, 0)

      toReturn.push({
        title: "Ink Mine tracking range",
        effect: `${parseFloat(
          ((effect[0] / effectAtZero[0]) * 100).toFixed(2)
        )}%`,
        effectFromMax: effect[1],
        ability: "BRU" as Ability,
        ap: amount,
        effectFromMaxActual:
          (effect[0] / getEffect(highMidLow, MAX_AP)[0]) * 100,
        getEffect: (ap: number) => Math.ceil(getEffect(highMidLow, ap)[0]),
      })
    }

    if (subWeapon === "Splash Wall") {
      const high = subWeaponData.mMaxHpHigh
      const mid = subWeaponData.mMaxHpMid
      const low = subWeaponData.mMaxHp
      const highMidLow = [high, mid, low]
      const effect = getEffect(highMidLow, amount)
      const effectAtZero = getEffect(highMidLow, 0)

      toReturn.push({
        title: "Splash Wall durability",
        effect: `${parseFloat(
          ((effect[0] / effectAtZero[0]) * 100).toFixed(2)
        )}%`,
        effectFromMax: effect[1],
        ability: "BRU" as Ability,
        ap: amount,
        effectFromMaxActual:
          (effect[0] / getEffect(highMidLow, MAX_AP)[0]) * 100,
        getEffect: (ap: number) =>
          parseFloat(
            ((getEffect(highMidLow, ap)[0] / effectAtZero[0]) * 100).toFixed(3)
          ),
      })
    }

    if (subWeapon === "Squid Beakon") {
      const high = subWeaponData.mSubRt_Effect_ActualCnt_High
      const mid = subWeaponData.mSubRt_Effect_ActualCnt_Mid
      const low = subWeaponData.mSubRt_Effect_ActualCnt_Low
      const highMidLow = [high, mid, low]
      const effect = getEffect(highMidLow, amount)

      toReturn.push({
        title: "Squid Beakon Quick Super Jump boost",
        effect: `${Math.floor(effect[0])}AP`,
        effectFromMax: effect[1],
        ability: "BRU" as Ability,
        ap: amount,
        effectFromMaxActual:
          (Math.floor(effect[0]) /
            Math.floor(getEffect(highMidLow, MAX_AP)[0])) *
          100,
        getEffect: (ap: number) => Math.floor(getEffect(highMidLow, ap)[0]),
        info:
          "When jumping to Sub Power Up boosted beakons QSJ AP bonus is applied on top of any existing QSJ the jumper has. 57AP can't be exceeded",
      })
    }

    return toReturn
  }

  function calculateRES(amount: number) {
    const RES = abilityJson["Ink Resistance Up"]

    const highArmor = RES.OpInk_Armor_HP_High
    const midArmor = RES.OpInk_Armor_HP_Mid
    const lowArmor = RES.OpInk_Armor_HP_Low
    const highMidLowArmor = [highArmor, midArmor, lowArmor]
    const effectArmor = getEffect(highMidLowArmor, amount)

    const highPerFrame = RES.OpInk_Damage_High
    const midPerFrame = RES.OpInk_Damage_Mid
    const lowPerFrame = RES.OpInk_Damage_Low
    const highMidLowPerFrame = [highPerFrame, midPerFrame, lowPerFrame]
    const effectPerFrame = getEffect(highMidLowPerFrame, amount)

    const highLimit = RES.OpInk_Damage_Lmt_High
    const midLimit = RES.OpInk_Damage_Lmt_Mid
    const lowLimit = RES.OpInk_Damage_Lmt_Low
    const highMidLowLimit = [highLimit, midLimit, lowLimit]
    const effectLimit = getEffect(highMidLowLimit, amount)

    const highVel = RES.OpInk_VelGnd_High
    const midVel = RES.OpInk_VelGnd_Mid
    const lowVel = RES.OpInk_VelGnd_Low
    const highMidLowVel = [highVel, midVel, lowVel]
    const effectVel = getEffect(highMidLowVel, amount)

    return [
      {
        title: "Frames before taking damage from enemy ink",
        effect: `${Math.ceil(effectArmor[0])} frames`,
        effectFromMax: effectArmor[1],
        ability: "RES" as Ability,
        ap: amount,
        effectFromMaxActual:
          (Math.ceil(effectArmor[0]) /
            Math.ceil(getEffect(highMidLowArmor, MAX_AP)[0])) *
          100,
        getEffect: (ap: number) => Math.ceil(getEffect(highMidLowArmor, ap)[0]),
        info:
          "Ink Resistance Up also allows you to jump higher and strafe faster while shooting in enemy ink",
      },
      {
        title: "Damage taken in enemy ink",
        effect: `${parseFloat(
          (effectPerFrame[0] * 100 - 0.05).toFixed(1)
        )}hp / frame`,
        effectFromMax: effectPerFrame[1],
        ability: "RES" as Ability,
        ap: amount,
        effectFromMaxActual:
          (parseFloat((effectPerFrame[0] * 100 - 0.05).toFixed(1)) /
            parseFloat(
              (getEffect(highMidLowPerFrame, 0)[0] * 100 - 0.05).toFixed(1)
            )) *
          100,
        getEffect: (ap: number) =>
          parseFloat(
            (getEffect(highMidLowPerFrame, ap)[0] * 100 - 0.05).toFixed(1)
          ),
      },
      {
        title: "Limit on the damage enemy ink can deal on you",
        effect: `${parseFloat((effectLimit[0] * 100 - 0.05).toFixed(1))}hp`,
        effectFromMax: effectLimit[1],
        ability: "RES" as Ability,
        ap: amount,
        effectFromMaxActual: parseFloat(
          (effectLimit[0] * 100 - 0.05).toFixed(1)
        ),
        getEffect: (ap: number) =>
          parseFloat(
            (getEffect(highMidLowLimit, ap)[0] * 100 - 0.05).toFixed(1)
          ),
      },
      {
        title: "Run speed in enemy ink",
        effect: `${parseFloat(
          (effectVel[0] * 100).toFixed(2)
        )}% of normal speed`,
        effectFromMax: effectVel[1],
        ability: "RES" as Ability,
        ap: amount,
        effectFromMaxActual: parseFloat((effectVel[0] * 100).toFixed(2)),
        getEffect: (ap: number) =>
          parseFloat((getEffect(highMidLowVel, ap)[0] * 100).toFixed(2)),
      },
    ]
  }

  function calculateBDU(amount: number) {
    const BDU = abilityJson["Bomb Defense Up DX"]

    const highSub = BDU.BurstDamageRt_SubL_High
    const midSub = BDU.BurstDamageRt_SubL_Mid
    const lowSub = BDU.BurstDamageRt_SubL_Low
    const highMidLowSub = [highSub, midSub, lowSub]
    const effectSub = getEffect(highMidLowSub, amount)

    const highSpecial = BDU.BurstDamageRt_Special_High
    const midSpecial = BDU.BurstDamageRt_Special_Mid
    const lowSpecial = BDU.BurstDamageRt_Special_Low
    const highMidLowSpecial = [highSpecial, midSpecial, lowSpecial]
    const effectSpecial = getEffect(highMidLowSpecial, amount)

    const inkMineData = weaponData["Ink Mine"]
    const pointSensorData = weaponData["Point Sensor"]
    let high = inkMineData.mMarkingFrameHigh
    let mid = inkMineData.mMarkingFrameMid
    let low = inkMineData.mMarkingFrame
    let highMidLow = [high, mid, low]
    const mineFrames = getEffect(highMidLow, 0)[0]

    high = pointSensorData.mMarkingFrameHigh
    mid = pointSensorData.mMarkingFrameMid
    low = pointSensorData.mMarkingFrame
    highMidLow = [high, mid, low]
    const sensorFrames = getEffect(highMidLow, 0)[0]

    const highSensor = BDU.MarkingTime_ShortRt_High
    const midSensor = BDU.MarkingTime_ShortRt_Mid
    const lowSensor = BDU.MarkingTime_ShortRt_Low
    const highMidLowSensor = [highSensor, midSensor, lowSensor]
    const effectSensor = getEffect(highMidLowSensor, amount)

    const highMine = BDU.MarkingTime_ShortRt_Trap_High
    const midMine = BDU.MarkingTime_ShortRt_Trap_Mid
    const lowMine = BDU.MarkingTime_ShortRt_Trap_Low
    const highMidLowMine = [highMine, midMine, lowMine]
    const effectMine = getEffect(highMidLowMine, amount)

    return [
      {
        title: "Sub Weapon damage radius (indirect)",
        effect: `${parseFloat((effectSub[0] * 100).toFixed(2))}%`,
        effectFromMax: effectSub[1],
        effectFromMaxActual: effectSub[0] * 100,
        ability: "BDU" as Ability,
        ap: amount,
        getEffect: (ap: number) =>
          parseFloat((getEffect(highMidLowSub, ap)[0] * 100).toFixed(3)),
        info:
          "Bomb Defense Up DX also lessens the radius of a direct bomb hit but it will never make a bomb not kill that would have dealt over 100dmg without any of the ability on",
      },
      {
        title: "Special Weapon damage radius (indirect)",
        effect: `${parseFloat((effectSpecial[0] * 100).toFixed(2))}%`,
        effectFromMax: effectSpecial[1],
        effectFromMaxActual: effectSpecial[0] * 100,
        ability: "BDU" as Ability,
        ap: amount,
        getEffect: (ap: number) =>
          parseFloat((getEffect(highMidLowSpecial, ap)[0] * 100).toFixed(3)),
        info:
          "Tenta Missiles, Inkjet, Splashdown, Baller, Bubble Blower, Booyah Bomb & Ultra Stamp generate damage lessened by Bomb Defense Up DX. OHKO's are unaffected",
      },
      {
        title: "Base tracking time (Point Sensor)",
        effect: `${Math.ceil(
          sensorFrames * effectSensor[0]
        )} frames (${parseFloat(
          (Math.ceil(sensorFrames * effectSensor[0]) / 60).toFixed(2)
        )} seconds)`,
        effectFromMax: effectSensor[1],
        ability: "BDU" as Ability,
        ap: amount,
        effectFromMaxActual:
          (Math.ceil(sensorFrames * effectSensor[0]) / sensorFrames) * 100,
        getEffect: (ap: number) =>
          Math.ceil(sensorFrames * getEffect(highMidLowSensor, ap)[0]),
      },
      {
        title: "Base tracking time (Ink Mine)",
        effect: `${Math.ceil(mineFrames * effectMine[0])} frames (${parseFloat(
          (Math.ceil(mineFrames * effectMine[0]) / 60).toFixed(2)
        )} seconds)`,
        effectFromMax: effectMine[1],
        ability: "BDU" as Ability,
        ap: amount,
        effectFromMaxActual:
          (Math.ceil(mineFrames * effectMine[0]) / mineFrames) * 100,
        getEffect: (ap: number) =>
          Math.ceil(mineFrames * getEffect(highMidLowMine, ap)[0]),
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
    QSJ: calculateQSJ,
    BRU: calculateBRU,
    RES: calculateRES,
    BDU: calculateBDU,
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
