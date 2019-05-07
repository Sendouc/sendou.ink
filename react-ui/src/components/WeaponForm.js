import React from 'react'
import { Dropdown } from 'semantic-ui-react'
import { weapons } from '../utils/lists'
import weaponDict from '../utils/english_internal.json'

const WeaponForm = (props) => {
  return (
    <div>
      <Dropdown 
        placeholder='Choose a weapon' 
        fluid 
        search 
        selection 
        options={weapons.map(w => 
          (
            {key: w, 
            text: w, 
            value: w, 
            image: {src: process.env.PUBLIC_URL + `/wpnSmall/Wst_${weaponDict[w]}.png`}})
          )
        }
        onChange={(event, { value }) => props.setWeaponForm(value)}
        value={props.weaponForm}
      />
    </div>
  )
}

export default WeaponForm 