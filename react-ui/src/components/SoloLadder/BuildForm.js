import React, { useState } from 'react'
import { Form, Message, Button } from 'semantic-ui-react'
import WeaponForm from '../XSearch/WeaponForm'
import Build from './Build'
import AbilityButtons from './AbilityButtons'

const BuildForm = () => {
  const [weaponForm, setWeaponForm] = useState('')
  const [title, setTitle] = useState('')
  const [abilities, setAbilities] = useState([["", "", "", ""], ["", "", "", ""], ["", "", "", ""]])
  const build = {
    weapon: weaponForm,
    title,
    headgear: abilities[0],
    clothing: abilities[1],
    shoes: abilities[2]
  }
  function isBuildComplete() {
    if (title.length > 100) return false
    if (weaponForm === '') return false
    for (let i = 0; i < abilities.length; i++) {
      for (let j = 0; j < abilities[i].length; j++) {
        const element = abilities[i][j]
        if (element === "") {
          return false
        }
      }
    }
    return true
  }
  return (
    <div>
      <div>
        <Build build={build} existingAbilities={abilities} setAbilities={setAbilities}/>
      </div>
      <div style={{"paddingTop": "15px"}}>
        <WeaponForm weaponForm={weaponForm} setWeaponForm={setWeaponForm} showImages={false} />
      </div>
      <div style={{"paddingTop": "15px"}}>
        <Form error={title.length > 100}>
          <Form.Field>
            <label>Choose title (optional)</label>
            <input placeholder='Choose title (optional)' value={title} onChange={(e) => setTitle(e.target.value) }/>
            <Message
              error
              content="Title can't be longer than 100 characters."
            />
          </Form.Field>
        </Form>
      </div>
      <div style={{"paddingTop": "10px"}}>
        <AbilityButtons abilities={abilities} setAbilities={setAbilities} />
      </div>
      <div style={{"paddingTop": "10px"}}>
        <Button disabled={!isBuildComplete()}>Add build</Button> {/*OnClick gotta remember that weapon or title can be empty */}
      </div>
    </div>
   )
}

export default BuildForm