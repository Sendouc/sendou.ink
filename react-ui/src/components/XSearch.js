import React, { useState, useEffect } from 'react'
import { Form, Message, Button } from 'semantic-ui-react'
import { Route, withRouter } from 'react-router-dom'
import WeaponForm from '../components/WeaponForm'
import InfoWeapon from '../components/InfoWeapon'
import InfoPlayer from '../components/InfoPlayer'
import XSearchResults from '../components/XSearchResults'
import weaponDict from '../utils/english_internal.json'

const XSearch = withRouter(({ history, setMenuSelection }) => {
  const [weaponForm, setWeaponForm] = useState('')
  const [playerForm, setPlayerForm] = useState('')
  const [exact, setExact] = useState(false)
  useEffect(() => {
    setMenuSelection('search')
    document.title = "X Rank Top 500 Search - sendou.ink"
  }, [setMenuSelection])
  return (
    <div>
      <div>
        <div style={{"paddingBottom": "12px"}}>
          <WeaponForm weaponForm={weaponForm} setWeaponForm={setWeaponForm} />
        </div>
        <Button disabled={weaponForm === ''} onClick={() => history.push(`/xsearch/w/${weaponDict[weaponForm].replace(/_/g, '-')}`)}>Search for a weapon</Button>
        <div style={{"paddingTop": "5px", "paddingBottom": "5px"}}><b>or</b></div>
        <Form>
          <Form.Input 
            placeholder='Search for a player'
            value={playerForm}
            onChange={(event) => setPlayerForm(event.target.value)} />
          <Message
            error
            content='No players matching this name could be found.'
          />
        </Form>
        <Button disabled={playerForm.length === 0}>Search for a player</Button>
        {playerForm.length !== 999 ? null : <XSearchResults name={playerForm} exact={exact} setPlayerForm={setPlayerForm} />}
      </div>
      <Route exact path="/xsearch/w/:wpn" render={({ match }) =>
        <InfoWeapon wpn={match.params.wpn.replace(/-/g, '_')} setWeaponForm={setWeaponForm} />
      } />
      <Route exact path="/xsearch/p/:uid" render={({ match }) =>
        <InfoPlayer uid={match.params.uid} />
      } />
    </div>
  )
}) //weapon forming renderöinti liian raskas

export default XSearch