import React from 'react'
import { Header } from 'semantic-ui-react'

import bridge from '../../img/s1Maps/bridge.png'
import depot from '../../img/s1Maps/depot.png'
import heights from '../../img/s1Maps/heights.png'
import mahi from '../../img/s1Maps/mahi.png'
import museum from '../../img/s1Maps/museum.png'
import rig from '../../img/s1Maps/rig.png'
import underpass from '../../img/s1Maps/underpass.png'

const NotFound = () => {
  const maps = [
    {
      name: 'Hammerhead Bridge',
      img: bridge
    },
    {
      name: 'Bluefin Depot',
      img: depot
    },
    {
      name: 'Flounder Heights',
      img: heights
    },
    {
      name: 'Mahi-Mahi Resort',
      img: mahi
    },
    {
      name: 'Museum d\'Alfonsino',
      img: museum
    },
    {
      name: 'Saltspray Rig',
      img: rig
    },
    {
      name: 'Urchin Underpass',
      img: underpass
    }
  ]
  const mapObject = maps[Math.floor(Math.random()*maps.length)]
  return (
    <>
      <div style={{display: 'flex',  justifyContent:'center', alignItems:'center'}}>
        <img style={{"height": "400px", "width": "auto", "paddingBottom": "5px"}} src={mapObject.img} alt={mapObject.name} />
      </div>
      <div style={{display: 'flex',  justifyContent:'center', alignItems:'center'}}>
        <Header size='small'>404 - Page not found</Header>
      </div>
      <div style={{display: 'flex',  justifyContent:'center', alignItems:'center'}}>
        <i>...not unlike how {mapObject.name} can't be found in Splatoon 2</i>
      </div>
    </>
  )
}

export default NotFound