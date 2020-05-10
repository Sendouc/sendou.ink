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
        title: "Sub weapon ink consumption",
        effect: `${parseFloat((effect[0] * 100).toFixed(2))}%`,
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

    const highKeyHumanoid = "RecoverNrmlFrm_Ink_High"
    const midKeyHumanoid = "RecoverNrmlFrm_Ink_Mid"
    const lowKeyHumanoid = "RecoverNrmlFrm_Ink_Low"
    const highHumanoid = REC[highKeyHumanoid]
    const midHumanoid = REC[midKeyHumanoid]
    const lowHumanoid = REC[lowKeyHumanoid]
    const highMidLowHumanoid = [highHumanoid, midHumanoid, lowHumanoid]
    const effectHumanoid = getEffect(highMidLowHumanoid, amount)

    return [
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
    ]
  }

  const abilityFunctions: Partial<Record<
    string,
    (amount: number) => Explanation[]
  >> = {
    ISM: calculateISM,
    ISS: calculateISS,
    REC: calculateREC,
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
