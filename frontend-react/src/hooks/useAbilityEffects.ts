import { Build, Ability } from "../types"
import { useEffect, useState } from "react"

interface Explanation {
  ability: Ability
  effect: number
  explanation: string
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

function calculateISM(amount: number) {
  console.log(amount)
  return { ability: "ISM" as Ability, effect: 0, explanation: "asd" }
}

const abilityFunctions: Partial<Record<
  Ability,
  (amount: number) => Explanation
>> = {
  ISM: calculateISM,
} as const

export default function useAbilityEffects(build: Partial<Build>) {
  const [explanations, setExplanations] = useState<Explanation[]>([])

  useEffect(() => {
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
