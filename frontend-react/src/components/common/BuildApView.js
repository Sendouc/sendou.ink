import React from "react"

import english_internal from "../../utils/english_internal.json"
import AbilityIcon from "./AbilityIcon"
import { Image, Divider } from "semantic-ui-react"

const BuildApView = ({ build }) => {
  const abilityArrays = [build.headgear, build.clothing, build.shoes]
  const mainOnlyAbilities = [
    "CB",
    "LDE",
    "OG",
    "T",
    "H",
    "NS",
    "TI",
    "RP",
    "AD",
    "DR",
    "SJ",
    "OS",
  ]

  const APObject = {}
  abilityArrays.forEach(arr =>
    arr.forEach((ability, index) => {
      let abilityPoints = index === 0 ? 10 : 3
      if (mainOnlyAbilities.indexOf(ability) !== -1) abilityPoints = 999
      APObject[ability] = APObject.hasOwnProperty(ability)
        ? APObject[ability] + abilityPoints
        : abilityPoints
    })
  )

  Object.keys(APObject).forEach(ability => {
    const points = APObject[ability]

    APObject.hasOwnProperty(points)
      ? APObject[points].push(ability)
      : (APObject[points] = [ability])
  })

  const APArray = Object.keys(APObject)
    .filter(key => !isNaN(key))
    .map(points => [points, APObject[points]])
    .sort((a1, a2) => a2[0] - a1[0])

  return (
    <>
      <div style={{ marginTop: "1em", paddingLeft: "2em" }}>
        {build.headgearItem && (
          <Image
            style={{
              width: "25%",
              height: "auto",
              marginRight: "1em",
            }}
            src={`https://raw.githubusercontent.com/Leanny/leanny.github.io/master/splat2/gear/${
              english_internal[build.headgearItem]
            }.png`}
          />
        )}
        {build.clothingItem && (
          <Image
            style={{
              width: "25%",
              height: "auto",
              marginRight: "1em",
            }}
            src={`https://raw.githubusercontent.com/Leanny/leanny.github.io/master/splat2/gear/${
              english_internal[build.clothingItem]
            }.png`}
          />
        )}
        {build.shoesItem && (
          <Image
            style={{
              width: "25%",
              height: "auto",
              marginRight: "1em",
            }}
            src={`https://raw.githubusercontent.com/Leanny/leanny.github.io/master/splat2/gear/${
              english_internal[build.shoesItem]
            }.png`}
          />
        )}
      </div>
      <div style={{ marginTop: "1em", color: "black" }}>
        {APArray.map((abilityPointArray, index) => {
          return (
            <div key={abilityPointArray[1]}>
              <Divider horizontal fitted>
                {abilityPointArray[0] === "999" ? (
                  "MAIN ONLY"
                ) : (
                  <b>
                    {abilityPointArray[0]}
                    {index === 0 && " AP"}
                  </b>
                )}
              </Divider>
              <div style={{ margin: "0.5em 0 0.5em 0", lineHeight: "250%" }}>
                {abilityPointArray[1].map(ability => (
                  <AbilityIcon
                    key={ability}
                    ability={ability}
                    size="SUB"
                    style={{ marginRight: "0.5em" }}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}

export default BuildApView
