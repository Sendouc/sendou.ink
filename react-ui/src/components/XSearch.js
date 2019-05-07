import React, { useState} from 'react'
import { Form, Message, Button } from 'semantic-ui-react'
import { Route, withRouter } from 'react-router-dom'
import WeaponForm from '../components/WeaponForm'
import InfoWeapon from '../components/InfoWeapon'
import weaponDict from '../utils/english_internal.json'

const XSearch = withRouter(({ history, setMenuSelection }) => {
  const [weaponForm, setWeaponForm] = useState('') // unknown if button pressed at the begin
  const [playerForm, setPlayerForm] = useState('')
  setMenuSelection('search')
  document.title = "X Rank Top 500 Search - sendou.ink"
  console.log('wpnform', weaponForm)
  return (
    <div>
      <div>
        <div style={{"paddingBottom": "12px"}}>
          <WeaponForm weaponForm={weaponForm} setWeaponForm={setWeaponForm} />
        </div>
        <Button onClick={() => history.push(`/xsearch/w/${weaponDict[weaponForm].replace(/_/g, '-')}`)}>Search for a weapon</Button>
        <div style={{"paddingTop": "5px", "paddingBottom": "5px"}}><b>or</b></div>
        <Form onChange={(event) => setPlayerForm(event.target.value)}>
          <Form.Input placeholder='Enter a player name' />
          <Message
            error
            content='No players matching this name could be found.'
          />
        </Form>
        <Button>Search for a player</Button>
      </div>
      <Route exact path="/xsearch/w/:wpn" render={({ match }) =>
        <InfoWeapon wpn={match.params.wpn.replace(/-/g, '_')}/>
      } />
    </div>
  )
})

export default XSearch