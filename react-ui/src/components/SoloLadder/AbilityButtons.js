/* eslint-disable jsx-a11y/alt-text */
import React from 'react'
import { Button } from 'semantic-ui-react'

import BDU from '../../img/abilityIcons/BDU.png'
import BRU from '../../img/abilityIcons/BRU.png'
import CB from '../../img/abilityIcons/CB.png'
import DR from '../../img/abilityIcons/DR.png'
import H from '../../img/abilityIcons/H.png'
import ISM from '../../img/abilityIcons/ISM.png'
import ISS from '../../img/abilityIcons/ISS.png'
import LDE from '../../img/abilityIcons/LDE.png'
import MPU from '../../img/abilityIcons/MPU.png'
import NS from '../../img/abilityIcons/NS.png'
import OG from '../../img/abilityIcons/OG.png'
import QR from '../../img/abilityIcons/QR.png'
import QSJ from '../../img/abilityIcons/QSJ.png'
import REC from '../../img/abilityIcons/REC.png'
import RES from '../../img/abilityIcons/RES.png'
import RP from '../../img/abilityIcons/RP.png'
import RSU from '../../img/abilityIcons/RSU.png'
import SCU from '../../img/abilityIcons/SCU.png'
import SJ from '../../img/abilityIcons/SJ.png'
import SPU from '../../img/abilityIcons/SPU.png'
import SS from '../../img/abilityIcons/SS.png'
import SSU from '../../img/abilityIcons/SSU.png'
import T from '../../img/abilityIcons/T.png'
import TI from '../../img/abilityIcons/TI.png'
import OS from '../../img/abilityIcons/OS.png'

const headOnly = ["CB", "LDE", "OG", "T"]
const clothingOnly = ["H", "NS", "TI", "RP"]
const shoesOnly = ["DR", "SJ", "OS"]

const AbilityButton = ({ abilities, setAbilities }) => {
  function handleClick(abilityName) {
    let copyOfArray = [...abilities]
    if (headOnly.includes(abilityName)) {
      if (abilities[0][0] === "") {
        copyOfArray[0][0] = abilityName
      }
    } else if (clothingOnly.includes(abilityName)) {
      if (abilities[1][0] === "") {
        copyOfArray[1][0] = abilityName
      }
    } else if (shoesOnly.includes(abilityName)) {
      if (abilities[2][0] === "") {
        copyOfArray[2][0] = abilityName
      }
    } else {
      for (let i = 0; i < abilities.length; i++) {
        for (let j = 0; j < abilities[i].length; j++) {
          const element = abilities[i][j]
          if (element === "") {
            copyOfArray[i][j] = abilityName
            setAbilities(copyOfArray)
            return
          }
        }
      }
    }
    setAbilities(copyOfArray)
  }
  return (
    <div> 
        {/*main only*/}
        <div>
          <Button circular color='black' onClick={() => handleClick('CB')} style={{"padding": "2px"}}><img src={CB} style={{ "maxWidth": "40px", "height": "auto" }} /></Button>
          <Button circular color='black' onClick={() => handleClick('LDE')} style={{"padding": "2px"}}><img src={LDE} style={{ "maxWidth": "40px", "height": "auto" }}/></Button>
          <Button circular color='black' onClick={() => handleClick('OG')} style={{"padding": "2px"}}><img src={OG} style={{ "maxWidth": "40px", "height": "auto" }}/></Button>
          <Button circular color='black' onClick={() => handleClick('T')} style={{"padding": "2px"}}><img src={T} style={{ "maxWidth": "40px", "height": "auto" }}/></Button>
          <Button circular color='black' onClick={() => handleClick('H')} style={{"padding": "2px"}}><img src={H} style={{ "maxWidth": "40px", "height": "auto" }}/></Button>
          <Button circular color='black' onClick={() => handleClick('NS')} style={{"padding": "2px"}}><img src={NS} style={{ "maxWidth": "40px", "height": "auto" }}/></Button>
          <Button circular color='black' onClick={() => handleClick('TI')} style={{"padding": "2px"}}><img src={TI} style={{ "maxWidth": "40px", "height": "auto" }}/></Button>
          <Button circular color='black' onClick={() => handleClick('RP')} style={{"padding": "2px"}}><img src={RP} style={{ "maxWidth": "40px", "height": "auto" }}/></Button>
          <Button circular color='black' onClick={() => handleClick('DR')} style={{"padding": "2px"}}><img src={DR} style={{ "maxWidth": "40px", "height": "auto" }}/></Button>
          <Button circular color='black' onClick={() => handleClick('SJ')} style={{"padding": "2px"}}><img src={SJ} style={{ "maxWidth": "40px", "height": "auto" }}/></Button>
          <Button circular color='black' onClick={() => handleClick('OS')} style={{"padding": "2px"}}><img src={OS} style={{ "maxWidth": "40px", "height": "auto" }}/></Button>
        </div>
        {/*stackables*/}
        <div style={{"paddingTop": "3px"}}>
          <Button circular color='black' onClick={() => handleClick('BDU')} style={{"padding": "2px"}}><img src={BDU} style={{ "maxWidth": "40px", "height": "auto" }}/></Button>
          <Button circular color='black' onClick={() => handleClick('ISM')} style={{"padding": "2px"}}><img src={ISM} style={{ "maxWidth": "40px", "height": "auto" }}/></Button>
          <Button circular color='black' onClick={() => handleClick('ISS')} style={{"padding": "2px"}}><img src={ISS} style={{ "maxWidth": "40px", "height": "auto" }}/></Button>
          <Button circular color='black' onClick={() => handleClick('REC')} style={{"padding": "2px"}}><img src={REC} style={{ "maxWidth": "40px", "height": "auto" }}/></Button>
          <Button circular color='black' onClick={() => handleClick('MPU')} style={{"padding": "2px"}}><img src={MPU} style={{ "maxWidth": "40px", "height": "auto" }}/></Button>
          <Button circular color='black' onClick={() => handleClick('SPU')} style={{"padding": "2px"}}><img src={SPU} style={{ "maxWidth": "40px", "height": "auto" }}/></Button>
          <Button circular color='black' onClick={() => handleClick('BRU')} style={{"padding": "2px"}}><img src={BRU} style={{ "maxWidth": "40px", "height": "auto" }}/></Button>
          <Button circular color='black' onClick={() => handleClick('QR')} style={{"padding": "2px"}}><img src={QR} style={{ "maxWidth": "40px", "height": "auto" }}/></Button>
          <Button circular color='black' onClick={() => handleClick('QSJ')} style={{"padding": "2px"}}><img src={QSJ} style={{ "maxWidth": "40px", "height": "auto" }}/></Button>
          <Button circular color='black' onClick={() => handleClick('SS')} style={{"padding": "2px"}}><img src={SS} style={{ "maxWidth": "40px", "height": "auto" }}/></Button>
          <Button circular color='black' onClick={() => handleClick('SCU')} style={{"padding": "2px"}}><img src={SCU} style={{ "maxWidth": "40px", "height": "auto" }}/></Button>
          <Button circular color='black' onClick={() => handleClick('SSU')} style={{"padding": "2px"}}><img src={SSU} style={{ "maxWidth": "40px", "height": "auto" }}/></Button>
          <Button circular color='black' onClick={() => handleClick('RSU')} style={{"padding": "2px"}}><img src={RSU} style={{ "maxWidth": "40px", "height": "auto" }}/></Button>
          <Button circular color='black' onClick={() => handleClick('RES')} style={{"padding": "2px"}}><img src={RES} style={{ "maxWidth": "40px", "height": "auto" }}/></Button>
        </div>
    </div>
  )
}

export default AbilityButton