import React, { useState } from 'react'
import { Dropdown, Button } from 'semantic-ui-react'
import { withRouter } from 'react-router-dom'
import { weapons } from '../../utils/lists'
import weaponDict from '../../utils/english_internal.json'

const WeaponForm = ({ weaponForm, setWeaponForm, showImages=true }) => {
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
            image: showImages ? {src: process.env.PUBLIC_URL + `/wpnSmall/Wst_${weaponDict[w]}.png`} : null
            }
          )
        )
        }
        onChange={(event, { value }) => setWeaponForm(value)}
        value={weaponForm}
      />
    </div>
  )
}

export const WeaponFormWithButton = withRouter(({ history }) => {
  const [weaponForm, setWeaponForm] = useState('')
  return (
    <div>
      <WeaponForm weaponForm={weaponForm} setWeaponForm={setWeaponForm} />
      <div style={{"paddingTop": "13px"}}>
        <Button disabled={weaponForm === ''} onClick={() => history.push(`/xsearch/w/${weaponDict[weaponForm].replace(/_/g, '-')}`)}>Search for a weapon</Button>
      </div>
    </div>
  )
})

export default WeaponForm 