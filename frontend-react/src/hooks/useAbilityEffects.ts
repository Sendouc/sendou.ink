import { Build, Ability, Weapon } from "../types"
import { useEffect, useState } from "react"
import { getEffect } from "../utils/getAbilityEffect"
import weaponJson from "../utils/weapon_data.json"
import abilityJson from "../utils/ability_data.json"

export interface Explanation {
  ability: Ability
  explanation: string
}

interface WeaponDataFromJson {
  InkSaverLv: "Middle" | "High" | string
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
  const weaponData: Record<Weapon, WeaponDataFromJson> = weaponJson

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
    return {
      ability: "ISM" as Ability,
      explanation: `Main weapon consumes ${(effect[0] * 100).toFixed(
        2
      )}% of ink it normally does`,
    }
  }

  const abilityFunctions: Partial<Record<
    Ability,
    (amount: number) => Explanation
  >> = {
    ISM: calculateISM,
  } as const

  useEffect(() => {
    if (!build.weapon) return
    console.log("usingEffect")
    const AP = buildToAP(build)

    const newExplanations: Explanation[] = []
    Object.keys(AP).forEach((ability) => {
      const func = abilityFunctions[ability as Ability]
      if (func) {
        const key = ability as Ability
        newExplanations.push(func(AP[key]!))
      }
    })

    setExplanations(newExplanations)
  }, [build])

  return explanations
}
