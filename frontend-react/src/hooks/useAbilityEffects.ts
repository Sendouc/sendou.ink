import { Build, Ability, Weapon, SubWeapon } from "../types"
import { useEffect, useState } from "react"
import { getEffect } from "../utils/getAbilityEffect"
import weaponJson from "../utils/weapon_data.json"
import abilityJson from "../utils/ability_data.json"
import internalEnglish from "../utils/internal_english.json"

export interface Explanation {
  title: string
  effect: string
  effectFromMax: number
}

interface WeaponDataFromJson {
  InkSaverLv?: "Middle" | "High" | string
  InkSaverType?: "A" | "B" | "C" | "D" | string
  Sub?: string
  mInkConsume?: number
  ShotMoveVelType?: "A" | "B" | "C" | "D" | "E" | string
  MoveVelLv?: "Low" | "Middle" | "High" | string
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
  const weaponData: Record<Weapon | SubWeapon, WeaponDataFromJson> = weaponJson

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
    return [
      {
        title: "Main weapon ink consumption",
        effect: `${parseFloat((effect[0] * 100).toFixed(2))}%`,
        effectFromMax: effect[1] * 100,
      },
    ]
  }

  function calculateISS(amount: number) {
    const ISS = abilityJson["Ink Saver (Sub)"]
    const buildWeaponData = weaponData[build.weapon!]
    const subInternal = buildWeaponData.Sub! as keyof typeof internalEnglish
    const subWeapon = internalEnglish[subInternal] as SubWeapon

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
    console.log("moveLv", moveLv)
    console.log("commonKey", commonKey)

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

    console.log("moveEffect", moveEffect)
    console.log("shootEffect", shootEffect)

    return []

    /*return [
      {
        title: "Ink tank recovery from empty to full (squid form)",
        effect: `${Math.ceil(effectSquid[0])} frames (${parseFloat(
          (effectSquid[0] / 60).toFixed(2)
        )} seconds)`,
        effectFromMax: effectSquid[1] * 100,
      },
      {
        title: "Ink tank recovery from empty to full (humanoid form)",
        effect: `${Math.ceil(effectHumanoid[0])} frames (${parseFloat(
          (effectHumanoid[0] / 60).toFixed(2)
        )} seconds)`,
        effectFromMax: effectHumanoid[1] * 100,
      },
    ]*/
  }

  const abilityFunctions: Partial<Record<
    string,
    (amount: number) => Explanation[]
  >> = {
    ISM: calculateISM,
    ISS: calculateISS,
    REC: calculateREC,
    RSU: calculateRSU,
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
