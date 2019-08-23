import React, { useState, useEffect } from 'react'
import { PageHeader } from 'antd'
import { Segment } from 'semantic-ui-react'
import { withRouter } from "react-router-dom"
import { useSelector } from 'react-redux'

import Select from '../elements/Select'
import BuildsList from '../Tools/BuildsList'

const PageBuilds = withRouter(({ history, weaponFromUrl, setMenuSelection }) => {
  const [weapon, setWeapon] = useState(weaponFromUrl ? weaponFromUrl : null)
  const localization = useSelector(state => state.localization)

  const handleFormChange = (value) => {
    setWeapon(value)
    history.push(`/builds/${value.replace(/ /g, "_")}`)
  }

  useEffect(() => {
    if (!weapon) document.title = `${localization["Builds"]} - sendou.ink`
    setMenuSelection("builds")
  }, [localization, weapon, setMenuSelection])

  return (
    <Segment>
      <div>
        <PageHeader title={localization["Build Search"]}/>
      </div>
      <div style={{margin: "0 1.5em"}}>
        <Select content="MAINWEAPONS" value={weapon} onChange={handleFormChange} />
      </div>
      <div style={{margin: "2em 1.5em 1.5em"}}>
        {weaponFromUrl && <BuildsList weapon={weaponFromUrl} />}
      </div>
    </Segment>
  )
})

export default PageBuilds