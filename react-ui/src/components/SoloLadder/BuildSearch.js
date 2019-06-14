import React, { useState, useEffect } from 'react'
import WeaponForm from '../XSearch/WeaponForm'
import BuildCollection from './BuildCollection'

const BuildSearch = ({ setMenuSelection, weaponFromUrl }) => {
  const [weapon, setWeapon] = useState(weaponFromUrl ? weaponFromUrl : '')

  useEffect(() => {
    setMenuSelection('builds')
    document.title = "Builds - sendou.ink"
  }, [setMenuSelection])

  return (
    <div>
      <div>
        <WeaponForm weaponForm={weapon} setWeaponForm={setWeapon} push />
      </div>
      <div>
        {weapon === '' ? null : <BuildCollection weapon={weapon}/>}
      </div>
    </div>
  )
}

export default BuildSearch