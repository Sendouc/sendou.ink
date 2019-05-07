import React from 'react'
import { Header } from 'semantic-ui-react'

import bridge from './s1Maps/bridge.png'
import depot from './s1Maps/depot.png'
import heights from './s1Maps/heights.png'
import mahi from './s1Maps/mahi.png'
import museum from './s1Maps/museum.png'
import rig from './s1Maps/rig.png'
import underpass from './s1Maps/underpass.png'

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
        <i>...not unlike {mapObject.name} can't be found in Splatoon 2</i>
      </div>
    </>
  )
}

export default NotFound