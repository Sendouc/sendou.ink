import React, { useState } from "react"
import { Grid, Comment } from "semantic-ui-react"
import { clothingGear, shoesGear, headGear, choose } from "../../utils/lists"
import useWindowDimensions from "../hooks/useWindowDimensions"

import BDU from '../../img/abilityIcons/BDU.png'
import BRU from "../../img/abilityIcons/BRU.png"
import CB from "../../img/abilityIcons/CB.png"
import DR from "../../img/abilityIcons/DR.png"
import H from "../../img/abilityIcons/H.png"
import ISM from "../../img/abilityIcons/ISM.png"
import ISS from "../../img/abilityIcons/ISS.png"
import LDE from "../../img/abilityIcons/LDE.png"
import MPU from "../../img/abilityIcons/MPU.png"
import NS from "../../img/abilityIcons/NS.png"
import OG from "../../img/abilityIcons/OG.png"
import QR from "../../img/abilityIcons/QR.png"
import QSJ from "../../img/abilityIcons/QSJ.png"
import REC from "../../img/abilityIcons/REC.png"
import RES from "../../img/abilityIcons/RES.png"
import RP from "../../img/abilityIcons/RP.png"
import RSU from "../../img/abilityIcons/RSU.png"
import SCU from "../../img/abilityIcons/SCU.png"
import SJ from "../../img/abilityIcons/SJ.png"
import SPU from "../../img/abilityIcons/SPU.png"
import SS from "../../img/abilityIcons/SS.png"
import SSU from "../../img/abilityIcons/SSU.png"
import T from "../../img/abilityIcons/T.png"
import TI from "../../img/abilityIcons/TI.png"
import OS from "../../img/abilityIcons/OS.png"
import murchpfp from "../../img/misc/murchpfp.png"
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
  ISM,
  ISS,
  REC,
  RSU,
  SSU,
  QSJ,
  RES,
  BDU,
  MPU,
  QR,
  SCU,
  SS,
  SPU,
  BRU,
  ISM,
  ISS,
  REC,
  RSU,
  SSU,
  QSJ,
  RES,
  BDU,
  MPU,
  QR,
  SCU,
  SS,
  SPU,
  BRU
]
const headAbilities = [
  ISM,
  ISS,
  REC,
  RSU,
  SSU,
  QSJ,
  RES,
  BDU,
  MPU,
  QR,
  SCU,
  SS,
  SPU,
  BRU,
  OG,
  LDE,
  CB,
  T
]
const clothingAbilities = [
  ISM,
  ISS,
  REC,
  RSU,
  SSU,
  QSJ,
  RES,
  BDU,
  MPU,
  QR,
  SCU,
  SS,
  SPU,
  BRU,
  H,
  NS,
  TI,
  RP
]
const shoeAbilities = [
  ISM,
  ISS,
  REC,
  RSU,
  SSU,
  QSJ,
  RES,
  BDU,
  MPU,
  QR,
  SCU,
  SS,
  SPU,
  BRU,
  DR,
  SJ,
  OS
]

const internalToAbility = {
  MainInk_Save: ISM,
  SubInk_Save: ISS,
  InkRecovery_Up: REC,
  HumanMove_Up: RSU,
  SquidMove_Up: SSU,
  JumpTime_Save: QSJ,
  RespawnTime_Save: QR,
  OpInkEffect_Reduction: RES,
  BombDamage_Reduction: BDU,
  MarkingTime_Reduction: MPU,
  RespawnSpecialGauge_Save: SS,
  SpecialIncrease_Up: SCU,
  SpecialTime_Up: SPU,
  BombDistance_Up: BRU
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
  const { containerWidth } = useWindowDimensions()

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
      <Grid columns="equal" stackable>
        <Grid.Row>
          <Grid.Column textAlign={containerWidth < 768 ? null : "left"}>
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
          </Grid.Column>
          <Grid.Column textAlign={containerWidth < 768 ? null : "center"}>
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
          </Grid.Column>
          <Grid.Column textAlign={containerWidth < 768 ? null : "right"}>
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
          </Grid.Column>
        </Grid.Row>
      </Grid>
      {rollCount > 0 && (
        <Comment.Group>
          <Comment>
            <Comment.Avatar as="a" src={murchpfp} />
            <Comment.Content>
              <Comment.Author>Murch</Comment.Author>
              <Comment.Text>
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
