import React, { useState } from 'react'
import { Button, Form, Checkbox } from 'semantic-ui-react'
import XSearchResults from '../components/XSearchResults'

const PlayerSearchForm = (props) => {
  const [playerForm, setPlayerForm] = useState('')
  const [exact, setExact] = useState(false)
  const [renderSearch, setRenderSearch] = useState(false)
  return (
    <div>
      <Form>
        <Form.Input 
          placeholder='Search for a player'
          value={playerForm}
          onChange={(event) => {
            setRenderSearch(false)
            setPlayerForm(event.target.value)} 
          }
          />
        <Button 
          disabled={playerForm.length === 0}
          onClick={() => setRenderSearch(true)}
        >
        Search for a player
        </Button>
      </Form>
      <div style={{"paddingTop": "7px"}}>
        <Checkbox label='Search for an exact match' onChange={() => setExact(!exact)} checked={exact} />
      </div>
      {renderSearch ? <XSearchResults name={playerForm} exact={exact} setPlayerForm={setPlayerForm} /> : null}
    </div>
  )
}

export default PlayerSearchForm 