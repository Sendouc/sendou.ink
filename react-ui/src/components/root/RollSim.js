import React, { useState } from "react"
import { Comment } from "semantic-ui-react"
import { clothingGear, shoesGear, headGear } from "../../utils/lists"
import { choose } from "../../utils/helperFunctions"

import { abilityIcons } from "../../assets/imageImports"
import murchpfp from "../../assets/murchpfp.png"
import head from "../../utils/head.json"
import clothes from "../../utils/clothes.json"
import shoes from "../../utils/shoes.json"

const mainAbilityStyle = {
  //https://github.com/loadout-ink/splat2-calc
  zIndex: "2",
  borderRadius: "50%",
  width: "40px",
  height: "40px",
  background: "#000",
  border: "2px solid #888",
  borderRight: "0px",
  borderBottom: "0px",
  backgroundSize: "100%",
  boxShadow: "0 0 0 1px #000"
}
const subAbilityStyle = {
  //https://github.com/loadout-ink/splat2-calc
  zIndex: "2",
  borderRadius: "50%",
  width: "30px",
  height: "30px",
  background: "#000",
  border: "2px solid #888",
  borderRight: "0px",
  borderBottom: "0px",
  backgroundSize: "100%",
  boxShadow: "0 0 0 1px #000"
}
const gearStyle = { maxWidth: "50px", height: "auto" }

const subAbilities = [
  abilityIcons.ISM,
  abilityIcons.ISS,
  abilityIcons.REC,
  abilityIcons.RSU,
  abilityIcons.SSU,
  abilityIcons.QSJ,
  abilityIcons.RES,
  abilityIcons.BDU,
  abilityIcons.MPU,
  abilityIcons.QR,
  abilityIcons.SCU,
  abilityIcons.SS,
  abilityIcons.SPU,
  abilityIcons.BRU,
  abilityIcons.ISM,
  abilityIcons.ISS,
  abilityIcons.REC,
  abilityIcons.RSU,
  abilityIcons.SSU,
  abilityIcons.QSJ,
  abilityIcons.RES,
  abilityIcons.BDU,
  abilityIcons.MPU,
  abilityIcons.QR,
  abilityIcons.SCU,
  abilityIcons.SS,
  abilityIcons.SPU,
  abilityIcons.BRU
]
const headAbilities = [
  abilityIcons.ISM,
  abilityIcons.ISS,
  abilityIcons.REC,
  abilityIcons.RSU,
  abilityIcons.SSU,
  abilityIcons.QSJ,
  abilityIcons.RES,
  abilityIcons.BDU,
  abilityIcons.MPU,
  abilityIcons.QR,
  abilityIcons.SCU,
  abilityIcons.SS,
  abilityIcons.SPU,
  abilityIcons.BRU,
  abilityIcons.OG,
  abilityIcons.LDE,
  abilityIcons.CB,
  abilityIcons.T
]
const clothingAbilities = [
  abilityIcons.ISM,
  abilityIcons.ISS,
  abilityIcons.REC,
  abilityIcons.RSU,
  abilityIcons.SSU,
  abilityIcons.QSJ,
  abilityIcons.RES,
  abilityIcons.BDU,
  abilityIcons.MPU,
  abilityIcons.QR,
  abilityIcons.SCU,
  abilityIcons.SS,
  abilityIcons.SPU,
  abilityIcons.BRU,
  abilityIcons.H,
  abilityIcons.NS,
  abilityIcons.TI,
  abilityIcons.RP
]
const shoeAbilities = [
  abilityIcons.ISM,
  abilityIcons.ISS,
  abilityIcons.REC,
  abilityIcons.RSU,
  abilityIcons.SSU,
  abilityIcons.QSJ,
  abilityIcons.RES,
  abilityIcons.BDU,
  abilityIcons.MPU,
  abilityIcons.QR,
  abilityIcons.SCU,
  abilityIcons.SS,
  abilityIcons.SPU,
  abilityIcons.BRU,
  abilityIcons.DR,
  abilityIcons.SJ,
  abilityIcons.OS
]

const internalToAbility = {
  MainInk_Save: abilityIcons.ISM,
  SubInk_Save: abilityIcons.ISS,
  InkRecovery_Up: abilityIcons.REC,
  HumanMove_Up: abilityIcons.RSU,
  SquidMove_Up: abilityIcons.SSU,
  JumpTime_Save: abilityIcons.QSJ,
  RespawnTime_Save: abilityIcons.QR,
  OpInkEffect_Reduction: abilityIcons.RES,
  BombDamage_Reduction: abilityIcons.BDU,
  MarkingTime_Reduction: abilityIcons.MPU,
  RespawnSpecialGauge_Save: abilityIcons.SS,
  SpecialIncrease_Up: abilityIcons.SCU,
  SpecialTime_Up: abilityIcons.SPU,
  BombDistance_Up: abilityIcons.BRU
}

const RollSim = () => {
  const [headLink] = useState(choose(headGear))
  const [clothingLink] = useState(choose(clothingGear))
  const [shoesLink] = useState(choose(shoesGear))
  const [headMain] = useState(choose(headAbilities))
  const [headSubs, setHeadSubs] = useState([
    choose(subAbilities),
    choose(subAbilities),
    choose(subAbilities)
  ])
  const [clothingMain] = useState(choose(clothingAbilities))
  const [clothingSubs, setClothingSubs] = useState([
    choose(subAbilities),
    choose(subAbilities),
    choose(subAbilities)
  ])
  const [shoesMain] = useState(choose(shoeAbilities))
  const [shoesSubs, setShoesSubs] = useState([
    choose(subAbilities),
    choose(subAbilities),
    choose(subAbilities)
  ])
  const [rolling, setRolling] = useState(false)
  const [rollCount, setRollCount] = useState(0)

  const setSubs = (json, gear) => {
    let gearName = gear.split("_")[1]
    if (!json.hasOwnProperty(gearName))
      return [choose(subAbilities), choose(subAbilities), choose(subAbilities)]
    const prefArray = json[gearName]
    if (prefArray[0] === prefArray[1]) {
      //neutral brand
      return [choose(subAbilities), choose(subAbilities), choose(subAbilities)]
    }

    const adjustedAbilities = [...subAbilities]
    const preferredAbility = internalToAbility[prefArray[0]]
    const unpreferredAbility = internalToAbility[prefArray[1]]

    for (let index = 0; index < adjustedAbilities.length; index++) {
      const element = adjustedAbilities[index]
      if (element === unpreferredAbility) {
        adjustedAbilities.splice(index, 1)
        break
      }
    }

    for (let index = 0; index < 8; index++) {
      adjustedAbilities.push(preferredAbility)
    }

    const ability1 = choose(adjustedAbilities)
    const ability2 = choose(adjustedAbilities)
    const ability3 = choose(adjustedAbilities)

    return [ability1, ability2, ability3]
  }

  const sleep = milliseconds => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
  }

  const roll = async mode => {
    if (rolling) return

    let setSubsState = null
    let json = null
    let gear = null
    if (mode === "HEAD") {
      setSubsState = setHeadSubs
      json = head
      gear = headLink
    } else if (mode === "CLOTHING") {
      setSubsState = setClothingSubs
      json = clothes
      gear = clothingLink
    } else {
      setSubsState = setShoesSubs
      json = shoes
      gear = shoesLink
    }

    setRolling(true)
    let ability1 = null
    let ability2 = null
    let ability3 = null
    for (let index = 0; index < 19; index++) {
      ability1 = choose(subAbilities)
      ability2 = choose(subAbilities)
      ability3 = choose(subAbilities)
      setSubsState([ability1, ability2, ability3])
      await sleep(75)
    }
    setSubsState(setSubs(json, gear)) //only using this method in the last roll that matters for optimization purposes
    setRolling(false)
    setRollCount(rollCount + 1)
  }

  return (
    <div>
      <div style={{ float: "none", whiteSpace: "nowrap" }}>
        <img
          src={`https://raw.githubusercontent.com/Leanny/leanny.github.io/master/splat2/gear/${headLink}.png`}
          style={gearStyle}
          alt=""
        />
        <img src={headMain} style={mainAbilityStyle} alt="" />
        <img
          src={headSubs[0]}
          style={subAbilityStyle}
          onClick={() => roll("HEAD")}
          alt=""
        />
        <img
          src={headSubs[1]}
          style={subAbilityStyle}
          onClick={() => roll("HEAD")}
          alt=""
        />
        <img
          src={headSubs[2]}
          style={subAbilityStyle}
          onClick={() => roll("HEAD")}
          alt=""
        />
      </div>
      <div style={{ float: "none", whiteSpace: "nowrap" }}>
        <img
          src={`https://raw.githubusercontent.com/Leanny/leanny.github.io/master/splat2/gear/${clothingLink}.png`}
          style={gearStyle}
          alt=""
        />
        <img src={clothingMain} style={mainAbilityStyle} alt="" />
        <img
          src={clothingSubs[0]}
          style={subAbilityStyle}
          alt=""
          onClick={() => roll("CLOTHING")}
        />
        <img
          src={clothingSubs[1]}
          style={subAbilityStyle}
          alt=""
          onClick={() => roll("CLOTHING")}
        />
        <img
          src={clothingSubs[2]}
          style={subAbilityStyle}
          alt=""
          onClick={() => roll("CLOTHING")}
        />
      </div>
      <div style={{ float: "none", whiteSpace: "nowrap" }}>
        <img
          src={`https://raw.githubusercontent.com/Leanny/leanny.github.io/master/splat2/gear/${shoesLink}.png`}
          style={gearStyle}
          alt=""
        />
        <img src={shoesMain} style={mainAbilityStyle} alt="" />
        <img
          src={shoesSubs[0]}
          style={subAbilityStyle}
          alt=""
          onClick={() => roll("SHOES")}
        />
        <img
          src={shoesSubs[1]}
          style={subAbilityStyle}
          alt=""
          onClick={() => roll("SHOES")}
        />
        <img
          src={shoesSubs[2]}
          style={subAbilityStyle}
          alt=""
          onClick={() => roll("SHOES")}
        />
      </div>
      {rollCount > 0 && (
        <Comment.Group>
          <Comment>
            <Comment.Avatar as="a" src={murchpfp} />
            <Comment.Content>
              <Comment.Author style={{ color: "white" }}>Murch</Comment.Author>
              <Comment.Text style={{ color: "white" }}>
                You have rolled {rollCount} {rollCount === 1 ? "time" : "times"}
                , chum.
              </Comment.Text>
            </Comment.Content>
          </Comment>
        </Comment.Group>
      )}
    </div>
  )
}

export default RollSim
