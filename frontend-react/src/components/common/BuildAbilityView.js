import React from "react"
import { Image } from "semantic-ui-react"

import english_internal from "../../utils/english_internal.json"
import AbilityIcon from "./AbilityIcon"

const BuildAbilityView = ({
  build,
  setHeadgear,
  setClothing,
  setShoes,
  setAbilities,
  existingAbilities,
}) => {
  function removeAbility(gearIndex, slotIndex) {
    let copyOfArray = [...existingAbilities]
    copyOfArray[gearIndex][slotIndex] = ""
    setAbilities(copyOfArray)
  }
  const noItems = !build.headgearItem && !build.clothingItem && !build.shoesItem

  return (
    <>
      <div style={{ marginTop: "1em" }}>
        {build.headgearItem && (
          <Image
            style={{
              width: "25%",
              height: "auto",
              marginRight: "1em",
              cursor: setHeadgear ? "pointer" : null,
            }}
            src={`https://raw.githubusercontent.com/Leanny/leanny.github.io/master/splat2/gear/${
              english_internal[build.headgearItem]
            }.png`}
            onClick={() => (setHeadgear ? setHeadgear("") : null)}
          />
        )}
        <span style={{ marginLeft: !build.headgearItem && !noItems && "80px" }}>
          {build.headgear.map((ability, index) => (
            <AbilityIcon
              key={index}
              ability={ability}
              size={index === 0 ? "MAIN" : "SUB"}
              style={{
                margin: "0 0.3em 0 0",
                cursor: setAbilities ? "pointer" : null,
              }}
              onClick={setAbilities ? () => removeAbility(0, index) : null}
            />
          ))}
        </span>
      </div>
      <div
        style={{
          margin: build.clothingItem ? "0 0 0 0" : "0.5em 0 0.5em 0",
        }}
      >
        {build.clothingItem && (
          <Image
            style={{
              width: "25%",
              height: "auto",
              marginRight: "1em",
              cursor: setClothing ? "pointer" : null,
            }}
            src={`https://raw.githubusercontent.com/Leanny/leanny.github.io/master/splat2/gear/${
              english_internal[build.clothingItem]
            }.png`}
            onClick={() => (setClothing ? setClothing("") : null)}
          />
        )}
        <span style={{ marginLeft: !build.clothingItem && !noItems && "80px" }}>
          {build.clothing.map((ability, index) => (
            <AbilityIcon
              key={index}
              ability={ability}
              size={index === 0 ? "MAIN" : "SUB"}
              style={{
                margin: "0 0.3em 0 0",
                cursor: setAbilities ? "pointer" : null,
              }}
              onClick={setAbilities ? () => removeAbility(1, index) : null}
            />
          ))}
        </span>
      </div>
      <>
        {build.shoesItem && (
          <Image
            style={{
              width: "25%",
              height: "auto",
              marginRight: "1em",
              cursor: setShoes ? "pointer" : null,
            }}
            src={`https://raw.githubusercontent.com/Leanny/leanny.github.io/master/splat2/gear/${
              english_internal[build.shoesItem]
            }.png`}
            onClick={() => (setShoes ? setShoes("") : null)}
          />
        )}
        <span style={{ marginLeft: !build.shoesItem && !noItems && "80px" }}>
          {build.shoes.map((ability, index) => (
            <AbilityIcon
              key={index}
              ability={ability}
              size={index === 0 ? "MAIN" : "SUB"}
              style={{
                margin: "0 0.3em 0 0",
                cursor: setAbilities ? "pointer" : null,
              }}
              onClick={setAbilities ? () => removeAbility(2, index) : null}
            />
          ))}
        </span>
      </>
    </>
  )
}

export default BuildAbilityView
