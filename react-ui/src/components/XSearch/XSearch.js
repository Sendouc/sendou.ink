import React, { useEffect } from 'react'
import { WeaponFormWithButton } from './WeaponForm'
import PlayerSearchForm from './PlayerSearchForm'

const XSearch = ({ setMenuSelection }) => {
  useEffect(() => {
    setMenuSelection('search')
    document.title = "X Rank Top 500 Search - sendou.ink"
  }, [setMenuSelection])
  return (
    <div>
      <div>
        <div style={{"paddingBottom": "5px"}}>
          <WeaponFormWithButton />
        </div>
        <div style={{"paddingBottom": "5px"}}><b>or</b></div>
          <PlayerSearchForm />
        </div>
    </div>
  )
}

export default XSearch