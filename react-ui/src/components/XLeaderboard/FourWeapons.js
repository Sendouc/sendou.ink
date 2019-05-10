import React from 'react'
import { Popup } from 'semantic-ui-react'
import weaponDict from '../../utils/english_internal.json'
import { modes, months, getNumberWithOrdinal } from '../../utils/lists'

const FourWeapons = ({ weapons }) => {
  return (
  <>
    <Popup
      trigger={
        <img 
          style={{"height": "60px", "width": "60px"}} 
          src={`https://raw.githubusercontent.com/Leanny/leanny.github.io/master/splat2/weapons/Wst_${weaponDict[weapons[0]["weapon"]]}.png`} 
          alt={weapons[0].name}
        />
      }
      header={weapons[0].name}
      content={`${weapons[0].x_power} (${getNumberWithOrdinal(weapons[0].rank)} ${modes[weapons[0].mode]} - ${months[weapons[0].month]} ${weapons[0].year})`}
      />

    <Popup
      trigger={
        <img 
          style={{"height": "60px", "width": "60px"}} 
          src={`https://raw.githubusercontent.com/Leanny/leanny.github.io/master/splat2/weapons/Wst_${weaponDict[weapons[1]["weapon"]]}.png`} 
          alt={weapons[1].name}
        />
      }
      header={weapons[1].name}
      content={`${weapons[1].x_power} (${getNumberWithOrdinal(weapons[1].rank)} ${modes[weapons[1].mode]} - ${months[weapons[1].month]} ${weapons[1].year})`}
    />

    <Popup
      trigger={
        <img 
          style={{"height": "60px", "width": "60px"}} 
          src={`https://raw.githubusercontent.com/Leanny/leanny.github.io/master/splat2/weapons/Wst_${weaponDict[weapons[2]["weapon"]]}.png`} 
          alt={weapons[2].name}
        />
      }
      header={weapons[2].name}
      content={`${weapons[2].x_power} (${getNumberWithOrdinal(weapons[2].rank)} ${modes[weapons[2].mode]} - ${months[weapons[2].month]} ${weapons[2].year})`}
    />

    <Popup
      trigger={
        <img 
          style={{"height": "60px", "width": "60px"}} 
          src={`https://raw.githubusercontent.com/Leanny/leanny.github.io/master/splat2/weapons/Wst_${weaponDict[weapons[3]["weapon"]]}.png`} 
          alt={weapons[3].name}
        />
      }
      header={weapons[3].name}
      content={`${weapons[3].x_power} (${getNumberWithOrdinal(weapons[3].rank)} ${modes[weapons[3].mode]} - ${months[weapons[3].month]} ${weapons[3].year})`}
    />
  </>
  )
}

export default FourWeapons