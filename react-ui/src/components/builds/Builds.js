import React, { useState, useEffect } from "react"
import { useHistory } from "react-router-dom"
import WeaponDropdown from "../common/WeaponDropdown"

const Builds = ({ weaponFromUrl }) => {
  const [weapon, setWeapon] = useState(weaponFromUrl ? weaponFromUrl : null)
  const history = useHistory()

  const handleFormChange = value => {
    setWeapon(value)
    history.push(`/builds/${value.replace(/ /g, "_")}`)
  }

  useEffect(() => {
    if (!weapon) document.title = "Builds - sendou.ink"
  }, [weapon])

  return (
    <>
      <div style={{ margin: "0 1.5em" }}>
        <WeaponDropdown value={weapon} onChange={() => handleFormChange} />
      </div>
      <div style={{ margin: "2em 1.5em 1.5em" }}>
        {weaponFromUrl ? <BuildsList weapon={weaponFromUrl} /> : null}
      </div>
    </>
  )
}

export default Builds
