import React, { useState } from 'react'
import { Grid } from 'semantic-ui-react'
import { clothingGear, shoesGear, headGear, choose } from '../../utils/lists'
import Sound from 'react-sound'
import useWindowDimensions from '../hooks/useWindowDimensions'

import BDU from '../img/abilityIcons/BDU.png'
import BRU from '../img/abilityIcons/BRU.png'
import CB from '../img/abilityIcons/CB.png'
import DR from '../img/abilityIcons/DR.png'
import H from '../img/abilityIcons/H.png'
import ISM from '../img/abilityIcons/ISM.png'
import ISS from '../img/abilityIcons/ISS.png'
import LDE from '../img/abilityIcons/LDE.png'
import MPU from '../img/abilityIcons/MPU.png'
import NS from '../img/abilityIcons/NS.png'
import OG from '../img/abilityIcons/OG.png'
import QR from '../img/abilityIcons/QR.png'
import QSJ from '../img/abilityIcons/QSJ.png'
import REC from '../img/abilityIcons/REC.png'
import RES from '../img/abilityIcons/RES.png'
import RP from '../img/abilityIcons/RP.png'
import RSU from '../img/abilityIcons/RSU.png'
import SCU from '../img/abilityIcons/SCU.png'
import SJ from '../img/abilityIcons/SJ.png'
import SPU from '../img/abilityIcons/SPU.png'
import SS from '../img/abilityIcons/SS.png'
import SSU from '../img/abilityIcons/SSU.png'
import T from '../img/abilityIcons/T.png'
import TI from '../img/abilityIcons/TI.png'
import OS from '../img/abilityIcons/OS.png'
import reroll from '../sounds/reroll.mp3'
import booyah from '../sounds/nice.mp3'

const RollSim = () => {

  const subAbilities = [ISM,ISS,REC,RSU,SSU,QSJ,RES,BDU,MPU,QR,SCU,SS,SPU,BRU]
  const headAbilities = [ISM,ISS,REC,RSU,SSU,QSJ,RES,BDU,MPU,QR,SCU,SS,SPU,BRU,OG,LDE,CB,T]
  const clothingAbilities = [ISM,ISS,REC,RSU,SSU,QSJ,RES,BDU,MPU,QR,SCU,SS,SPU,BRU,H,NS,TI,RP]
  const shoeAbilities = [ISM,ISS,REC,RSU,SSU,QSJ,RES,BDU,MPU,QR,SCU,SS,SPU,BRU,DR,SJ,OS]

  const [headLink] = useState(choose(headGear))
  const [headMain] = useState(choose(headAbilities))
  const [headSubs, setHeadSubs] = useState([choose(subAbilities), choose(subAbilities), choose(subAbilities)])
  const [clothingLink] = useState(choose(clothingGear))
  const [clothingMain] = useState(choose(clothingAbilities))
  const [clothingSubs, setClothingSubs] = useState([choose(subAbilities), choose(subAbilities), choose(subAbilities)])
  const [shoesLink] = useState(choose(shoesGear))
  const [shoesMain] = useState(choose(shoeAbilities))
  const [shoesSubs, setShoesSubs] = useState([choose(subAbilities), choose(subAbilities), choose(subAbilities)])
  const [rolling, setRolling] = useState(false)
  const { containerWidth } = useWindowDimensions()
  const [audio, setAudio] = useState(Sound.status.STOPPED)
  const [nice, setNice] = useState(Sound.status.STOPPED)

  const gearStyle = { "maxWidth": "50px", "height": "auto" }
  const mainAbilityStyle = {  //https://github.com/loadout-ink/splat2-calc
    "zIndex": "2", 
    "borderRadius": "50%",
    "width": "40px",
    "height": "40px",
    "background": "#000",
    "border": "2px solid #888",
    "borderRight": "0px",
    "borderBottom": "0px",
    "backgroundSize": "100%",
    "boxShadow": "0 0 0 1px #000"
  }
  const subAbilityStyle = {  //https://github.com/loadout-ink/splat2-calc
    "zIndex": "2", 
    "borderRadius": "50%",
    "width": "30px",
    "height": "30px",
    "background": "#000",
    "border": "2px solid #888",
    "borderRight": "0px",
    "borderBottom": "0px",
    "backgroundSize": "100%",
    "boxShadow": "0 0 0 1px #000"
  }

  const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
  }
  

  const roll = async (setSubs) => {
    if (rolling) return
    setRolling(true)
    setAudio(Sound.status.PLAYING)
    let ability1 = null
    let ability2 = null
    let ability3 = null
    for (let index = 0; index < 16; index++) {
      ability1 = choose(subAbilities)
      ability2 = choose(subAbilities)
      ability3 = choose(subAbilities)
      setSubs([ability1, ability2, ability3])
      await sleep(75)
    }
    setAudio(Sound.status.STOPPED)
    if (ability1 === ability2 && ability2 === ability3) setNice(Sound.status.PLAYING)
    setRolling(false)
  }

  return (
    <div>
      <Sound url={reroll} playStatus={audio} loop={true} volume={10} />
      <Sound url={booyah} playStatus={nice} volume={10} onFinishedPlaying={() => setNice(Sound.status.STOPPED)} />
      <Grid columns='equal' stackable>
        <Grid.Column textAlign={containerWidth < 768 ? null : "left"}>
          <div style={{'float': 'none', 'whiteSpace': 'nowrap'}}>
            <img src={`https://raw.githubusercontent.com/Leanny/leanny.github.io/master/splat2/gear/${headLink}.png`} style={gearStyle} alt="" />
            <img src={headMain} style={mainAbilityStyle} alt=""/>
            <img src={headSubs[0]} style={subAbilityStyle} onClick={() => roll(setHeadSubs)} alt="" />
            <img src={headSubs[1]} style={subAbilityStyle} onClick={() => roll(setHeadSubs)} alt="" />
            <img src={headSubs[2]} style={subAbilityStyle} onClick={() => roll(setHeadSubs)} alt="" />
          </div>
        </Grid.Column>
        <Grid.Column textAlign={containerWidth < 768 ? null : "center"}>
          <div style={{'float': 'none', 'whiteSpace': 'nowrap'}}>
            <img src={`https://raw.githubusercontent.com/Leanny/leanny.github.io/master/splat2/gear/${clothingLink}.png`} style={gearStyle} alt="" />
            <img src={clothingMain} style={mainAbilityStyle} alt="" />
            <img src={clothingSubs[0]} style={subAbilityStyle} alt="" onClick={() => roll(setClothingSubs)} />
            <img src={clothingSubs[1]} style={subAbilityStyle} alt="" onClick={() => roll(setClothingSubs)} />
            <img src={clothingSubs[2]} style={subAbilityStyle} alt="" onClick={() => roll(setClothingSubs)} />
          </div>
        </Grid.Column>
        <Grid.Column textAlign={containerWidth < 768 ? null : "right"}>
          <div style={{'float': 'none', 'whiteSpace': 'nowrap'}}>
            <img src={`https://raw.githubusercontent.com/Leanny/leanny.github.io/master/splat2/gear/${shoesLink}.png`} style={gearStyle} alt="" />
            <img src={shoesMain} style={mainAbilityStyle} alt=""/>
            <img src={shoesSubs[0]} style={subAbilityStyle} alt="" onClick={() => roll(setShoesSubs)} />
            <img src={shoesSubs[1]} style={subAbilityStyle} alt="" onClick={() => roll(setShoesSubs)} />
            <img src={shoesSubs[2]} style={subAbilityStyle} alt="" onClick={() => roll(setShoesSubs)} />
          </div>
        </Grid.Column>
      </Grid>
    </div>
  )
}

export default RollSim