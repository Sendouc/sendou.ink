import React, { useState } from 'react'
import { Form, Message, Button } from 'semantic-ui-react'
import WeaponForm from '../XSearch/WeaponForm'
import Build from './Build'
import AbilityButtons from './AbilityButtons'

// TODO: Bug with editing build.
const BuildForm = ({ addBuild, setShowForm, setSuccessMsg, existingBuild, setShowEdit, editBuildFunction }) => {
  const [weaponForm, setWeaponForm] = useState(existingBuild ? existingBuild.weapon : '')
  const [title, setTitle] = useState(existingBuild ? existingBuild.title : '')
  const [abilities, setAbilities] = useState(existingBuild ? [[...existingBuild.headgear], [...existingBuild.clothing], [...existingBuild.shoes]] : [["", "", "", ""], ["", "", "", ""], ["", "", "", ""]])

  const build = {
    id: existingBuild ? existingBuild.id : null,
    weapon: weaponForm,
    title,
    headgear: abilities[0],
    clothing: abilities[1],
    shoes: abilities[2]
  }

  const submit = async (e) => {
    e.preventDefault()

    let buildToAdd = {...build}
    if (buildToAdd.title === '') delete buildToAdd.title

    await addBuild({
      variables: { ...buildToAdd }
    })

    setWeaponForm('')
    setTitle('')
    setAbilities([["", "", "", ""], ["", "", "", ""], ["", "", "", ""]])
    setSuccessMsg('New build succesfully added!')
    setTimeout(() => { setSuccessMsg(null) }, 10000)
    setShowForm(false)
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
        <Build build={build} existingAbilities={abilities} setAbilities={setAbilities} />
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
        {editBuildFunction ?
        <><Button disabled={!isBuildComplete()} onClick={() => {
          editBuildFunction(build)
          setShowEdit(false)
          window.scrollTo(0, 0)
        }}>Edit build</Button> 
        <Button negative onClick={() => setShowEdit(false)}>Cancel</Button></> :
        <Button disabled={!isBuildComplete()} onClick={submit}>Add build</Button> 
        }
      </div>
    </div>
   )
}

export default BuildForm