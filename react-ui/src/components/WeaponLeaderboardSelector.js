import React, { useState } from 'react'
import { Menu } from 'semantic-ui-react'
import WeaponLeaderboard from './WeaponLeaderboard'
import { topTotalPlayers } from '../graphql/queries/topPlayers'
import allIcon from './wpnIcons/all.png'
import blasterIcon from './wpnIcons/blasters.png'
import brellaIcon from './wpnIcons/brellas.png'
import chargerIcon from './wpnIcons/chargers.png'
import dualieIcon from './wpnIcons/dualies.png'
import flexIcon from './wpnIcons/flex.png'
import rollerIcon from './wpnIcons/rollers.png'
import shooterIcon from './wpnIcons/shooters.png'
import slosherIcon from './wpnIcons/sloshers.png'
import splatlingIcon from './wpnIcons/splatlings.png'

const WeaponLeaderboardSelector = () => {

  const [activeItem, setActiveItem] = useState('all')

  const wpnIcon = {
    paddingBottom: "5px"
  }

  return (
    <div>
      <div className="ui centered grid">
        <div className="center aligned column">
          <Menu compact icon='labeled'>
            <Menu.Item 
              name='all' 
              active={activeItem === 'all'} 
              onClick={() => setActiveItem('all')}
            >
              <img style={wpnIcon} src={allIcon} alt="All Icon"/>
              All
            </Menu.Item>

            <Menu.Item 
              name='flex' 
              active={activeItem === 'flex'} 
              onClick={() => setActiveItem('flex')}
            >
              <img style={wpnIcon} src={flexIcon} alt="Flex Icon"/>
              Flex
            </Menu.Item>

            <Menu.Item
              name='shooters'
              active={activeItem === 'shooters'}
              onClick={() => setActiveItem('shooters')}
            >
              <img style={wpnIcon} src={shooterIcon} alt="Shooter Icon"/>
              Shooters
            </Menu.Item>

            <Menu.Item
              name='blasters'
              active={activeItem === 'blasters'}
              onClick={() => setActiveItem('blasters')}
            >
              <img style={wpnIcon} src={blasterIcon} alt="Blaster Icon"/>
              Blasters
            </Menu.Item>

            <Menu.Item
              name='rollers'
              active={activeItem === 'rollers'}
              onClick={() => setActiveItem('rollers')}
            >
              <img style={wpnIcon} src={rollerIcon} alt="Roller Icon"/>
              Rollers
            </Menu.Item>

            <Menu.Item
              name='chargers'
              active={activeItem === 'chargers'}
              onClick={() => setActiveItem('chargers')}
            >
              <img style={wpnIcon} src={chargerIcon} alt="Charger Icon"/>
              Chargers
            </Menu.Item>

            <Menu.Item
              name='splatlings'
              active={activeItem === 'splatlings'}
              onClick={() => setActiveItem('splatlings')}
            >
              <img style={wpnIcon} src={splatlingIcon} alt="Splatling Icon"/>
              Splatlings
            </Menu.Item>

            <Menu.Item
              name='sloshers'
              active={activeItem === 'sloshers'}
              onClick={() => setActiveItem('sloshers')}
            >
              <img style={wpnIcon} src={slosherIcon} alt="Slosher Icon"/>
              Sloshers
            </Menu.Item>

            <Menu.Item
              name='dualies'
              active={activeItem === 'dualies'}
              onClick={() => setActiveItem('dualies')}
            >
              <img style={wpnIcon} src={dualieIcon} alt="Dualie Icon"/>
              Dualies
            </Menu.Item>

            <Menu.Item
              name='brella'
              active={activeItem === 'brella'}
              onClick={() => setActiveItem('brella')}
            >
              <img style={wpnIcon} src={brellaIcon} alt="Brella Icon"/>
              Brellas
            </Menu.Item>
          </Menu>
        </div>
      </div>
      <WeaponLeaderboard 
        query={topTotalPlayers}
        queryName="topTotalPlayers"
        scoreField="topTotalScore"
      />
    </div>
  )
}

export default WeaponLeaderboardSelector