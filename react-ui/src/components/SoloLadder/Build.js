/* eslint-disable jsx-a11y/alt-text */
import React from 'react'
import { Header, Segment, List, Grid, Button, Popup } from 'semantic-ui-react'
import weaponDict from '../../utils/english_internal.json'

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
import EMPTY from '../img/abilityIcons/EMPTY.png'

const Build = ({ build, existingAbilities, setAbilities, removeBuildFunction }) => {

  const lineStyle = {
    "display": "inline-block",
    "width": "2px",
    "backgroundColor": "white",
    "margin": "0 10px",
    "height": "4em"
  }

  const abilities = {
    "BDU": {image: BDU, fullName: "Bomb Defense Up DX"},
    "BRU": {image: BRU, fullName: "Sub Power Up"},
    "CB": {image: CB, fullName: "Comeback", mainOnly: true},
    "DR": {image: DR, fullName: "Drop Roller", mainOnly: true},
    "H": {image: H, fullName: "Haunt", mainOnly: true},
    "ISM": {image: ISM, fullName: "Ink Saver (Main)"},
    "ISS": {image: ISS, fullName: "Ink Saver (Sub)"},
    "LDE": {image: LDE, fullName: "Last-Ditch Effort", mainOnly: true},
    "MPU": {image: MPU, fullName: "Main Power Up"},
    "NS": {image: NS, fullName: "Ninja Squid", mainOnly: true},
    "OG": {image: OG, fullName: "Opening Gambit", mainOnly: true},
    "QR": {image: QR, fullName: "Quick Respawn"},
    "QSJ": {image: QSJ, fullName: "Quick Super Jump"},
    "REC": {image: REC, fullName: "Ink Recovery Up"},
    "RES": {image: RES, fullName: "Ink Resistance Up"},
    "RP": {image: RP, fullName: "Respawn Punisher", mainOnly: true},
    "RSU": {image: RSU, fullName: "Run Speed Up"},
    "SCU": {image: SCU, fullName: "Special Charge Up"},
    "SJ": {image: SJ, fullName: "Stealth Jump", mainOnly: true},
    "SPU": {image: SPU, fullName: "Special Power Up"},
    "SS": {image: SS, fullName: "Special Saver"},
    "SSU": {image: SSU, fullName: "Swim Speed Up"},
    "T": {image: T, fullName: "Tenacity", mainOnly: true},
    "TI": {image: TI, fullName: "Thermal Ink", mainOnly: true},
    "OS": {image: OS, fullName: "Object Shredder", mainOnly: true},
    "": {mainOnly: true}
  }

  const arrayOfSortedAbilityPoints = () => {
    var sortable = []
    for (var abilityObj in abilities) {
      if (abilities[abilityObj].hasOwnProperty("ap") && !abilities[abilityObj].mainOnly) {
        sortable.push(abilities[abilityObj])
      }
    }
    sortable.sort((a, b) => {
      return b.ap - a.ap
    })
    return sortable
  }

  const imageSource = build.weapon === '' ? EMPTY : `https://raw.githubusercontent.com/Leanny/leanny.github.io/master/splat2/weapons/Wst_${weaponDict[build.weapon]}.png`
  
  function removeAbility(gearIndex, slotIndex) {
    let copyOfArray = [...existingAbilities]
    copyOfArray[gearIndex][slotIndex] = ""
    setAbilities(copyOfArray)
  }
  
  function abilityMap(a, i) {
    const ap = abilities[a].ap ? abilities[a].ap : 0
    const imageSrc = a === "" ? EMPTY : abilities[a].image
    if (i === 0) {
      if (a !== "") abilities[a].ap = ap + 10
      return (
        <span key={i}>
          <img src={imageSrc} alt={a} onClick={() => !setAbilities ? null : removeAbility(this.gearIndex, i)}/> {/* If setAbilities exists it means clicking ability should remove it. */}
          <span style={lineStyle} />
        </span>
      )
    }
    if (a !== "") abilities[a].ap = ap + 3
    return (
      <span key={i} style={{"padding": "1px"}}>
        <img 
          src={imageSrc} 
          alt={a} 
          style={{ "maxWidth": "40px", "height": "auto" }}
          onClick={() => !setAbilities ? null : removeAbility(this.gearIndex, i)} 
        />
      </span>
    )
  }

  const buildTitle = !build.title || build.title === "" ? `${build.weapon} Build` : build.title
  
  return (
    <div>
      <Segment inverted>
      <div>
        <Header size='huge' inverted>
          <img 
            src={imageSource}
          /> {buildTitle}
        </Header>
      </div>
      <div style={{"paddingLeft": "13px"}}>
        <Grid stackable columns={4}>
          <Grid.Column>
            <div style={{'float': 'none', 'whiteSpace': 'nowrap'}}>
              {build.headgear.map(abilityMap, {gearIndex: 0})}
            </div>
            <div style={{'float': 'none', 'whiteSpace': 'nowrap'}}>
              {build.clothing.map(abilityMap, {gearIndex: 1})}
            </div>
            <div style={{'float': 'none', 'whiteSpace': 'nowrap'}}>
              {build.shoes.map(abilityMap, {gearIndex: 2})}
            </div>
          </Grid.Column>
          <Grid.Column></Grid.Column>
          <Grid.Column>
            <List>
              {arrayOfSortedAbilityPoints().map(a => <List.Item key={a.fullName}>{a.ap} {a.fullName}</List.Item>)}
            </List>
          </Grid.Column>
          <Grid.Column verticalAlign='bottom'>
            {setAbilities ? null : <i>Added {new Date(parseInt(build.createdAt)).toLocaleString('en-GB')}</i>} 
            {removeBuildFunction ?
              <span style={{'paddingLeft': '10px'}}>
                <Popup 
                    trigger={<Button circular size='mini' icon='trash' />}
                    hoverable
                    position='bottom right'
                  ><Button negative onClick={ () => removeBuildFunction(build) }>{'Delete'}</Button></Popup>
              </span>
            : null}
          </Grid.Column>
        </Grid>
      </div>
      </Segment>
    </div>
   )
}

export default Build