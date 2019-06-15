import React, { useState, useEffect } from 'react'
import WeaponForm from '../XSearch/WeaponForm'
import BuildCollection from './BuildCollection'

const BuildSearch = ({ setMenuSelection, weaponFromUrl }) => {
  const [weapon, setWeapon] = useState(weaponFromUrl ? weaponFromUrl : '')
  const [page, setPage] = useState(1)

  useEffect(() => {
    setMenuSelection('builds')
    document.title = "Builds - sendou.ink"
  }, [setMenuSelection])

  return (
    <div>
      <div>
        <WeaponForm weaponForm={weapon} setWeaponForm={setWeapon} push setPage={setPage} />
      </div>
      <div>
        {weapon === '' ? null : <BuildCollection weapon={weapon} page={page} setPage={setPage} />}
      </div>
    </div>
  )
}

export default BuildSearch