import React, { useState } from 'react'
import { Menu, Responsive } from 'semantic-ui-react'
import { Route, withRouter } from 'react-router-dom'
import WeaponLeaderboard from './WeaponLeaderboard'
import { topTotalPlayers } from '../graphql/queries/topPlayers'
import { topShooterPlayers } from '../graphql/queries/topShooters'
import { topBlasterPlayers } from '../graphql/queries/topBlasters'
import { topBrellaPlayers } from '../graphql/queries/topBrellas'
import { topChargerPlayers } from '../graphql/queries/topChargers'
import { topDualiesPlayers } from '../graphql/queries/topDualies'
import { topRollerPlayers } from '../graphql/queries/topRollers'
import { topSlosherPlayers } from '../graphql/queries/topSloshers'
import { topSplatlingPlayers } from '../graphql/queries/topSplatlings'
import allIcon from './img/wpnIcons/all.png'
import blasterIcon from './img/wpnIcons/blasters.png'
import brellaIcon from './img/wpnIcons/brellas.png'
import chargerIcon from './img/wpnIcons/chargers.png'
import dualieIcon from './img/wpnIcons/dualies.png'
import rollerIcon from './img/wpnIcons/rollers.png'
import shooterIcon from './img/wpnIcons/shooters.png'
import slosherIcon from './img/wpnIcons/sloshers.png'
import splatlingIcon from './img/wpnIcons/splatlings.png'

const WeaponLeaderboardSelector = withRouter(({ history, setMenuSelection }) => {
  const [activeItem, setActiveItem] = useState('')
  const wpnIcon = {
    paddingBottom: "5px"
  }

  setMenuSelection('leaderboards')

  return (
    <div>
      <div className="ui centered grid">
        <div className="center aligned column">
          <Responsive minWidth={800}>
            <Menu compact icon='labeled'>
              <Menu.Item 
                name='all' 
                active={activeItem === 'topTotal'} 
                onClick={() => { history.push('/xleaderboard')}}
              >
                <img style={wpnIcon} src={allIcon} alt="All Icon"/>
                All
              </Menu.Item>

              <Menu.Item
                name='shooters'
                active={activeItem === 'topShooter'}
                onClick={() => { history.push('/xleaderboard/shooters')}}
              >
                <img style={wpnIcon} src={shooterIcon} alt="Shooter Icon"/>
                Shooters
              </Menu.Item>

              <Menu.Item
                name='blasters'
                active={activeItem === 'topBlaster'}
                onClick={() => { history.push('/xleaderboard/blasters')}}
              >
                <img style={wpnIcon} src={blasterIcon} alt="Blaster Icon"/>
                Blasters
              </Menu.Item>

              <Menu.Item
                name='rollers'
                active={activeItem === 'topRoller'}
                onClick={() => { history.push('/xleaderboard/rollers')}}
              >
                <img style={wpnIcon} src={rollerIcon} alt="Roller Icon"/>
                Rollers
              </Menu.Item>

              <Menu.Item
                name='chargers'
                active={activeItem === 'topCharger'}
                onClick={() => { history.push('/xleaderboard/chargers')}}
              >
                <img style={wpnIcon} src={chargerIcon} alt="Charger Icon"/>
                Chargers
              </Menu.Item>

              <Menu.Item
                name='splatlings'
                active={activeItem === 'topSplatling'}
                onClick={() => { history.push('/xleaderboard/splatlings')}}
              >
                <img style={wpnIcon} src={splatlingIcon} alt="Splatling Icon"/>
                Splatlings
              </Menu.Item>

              <Menu.Item
                name='sloshers'
                active={activeItem === 'topSlosher'}
                onClick={() => { history.push('/xleaderboard/sloshers')}}
              >
                <img style={wpnIcon} src={slosherIcon} alt="Slosher Icon"/>
                Sloshers
              </Menu.Item>

              <Menu.Item
                name='dualies'
                active={activeItem === 'topDualies'}
                onClick={() => { history.push('/xleaderboard/dualies')}}
              >
                <img style={wpnIcon} src={dualieIcon} alt="Dualie Icon"/>
                Dualies
              </Menu.Item>

              <Menu.Item
                name='brella'
                active={activeItem === 'topBrella'}
                onClick={() => { history.push('/xleaderboard/brellas')}}
              >
                <img style={wpnIcon} src={brellaIcon} alt="Brella Icon"/>
                Brellas
              </Menu.Item>
            </Menu>
          </Responsive>
          <Responsive maxWidth={799}>
            <Menu compact icon='labeled'>
              <Menu.Item 
                name='all' 
                active={activeItem === 'topTotal'} 
                onClick={() => { history.push('/xleaderboard')}}
              >
                <img style={wpnIcon} src={allIcon} alt="All Icon"/>
                All
              </Menu.Item>
            </Menu>
            <Menu compact icon='labeled'>
              <Menu.Item
                name='shooters'
                active={activeItem === 'topShooter'}
                onClick={() => { history.push('/xleaderboard/shooters')}}
              >
                <img style={wpnIcon} src={shooterIcon} alt="Shooter Icon"/>
                Shooters
              </Menu.Item>

              <Menu.Item
                name='blasters'
                active={activeItem === 'topBlaster'}
                onClick={() => { history.push('/xleaderboard/blasters')}}
              >
                <img style={wpnIcon} src={blasterIcon} alt="Blaster Icon"/>
                Blasters
              </Menu.Item>

              <Menu.Item
                name='rollers'
                active={activeItem === 'topRoller'}
                onClick={() => { history.push('/xleaderboard/rollers')}}
              >
                <img style={wpnIcon} src={rollerIcon} alt="Roller Icon"/>
                Rollers
              </Menu.Item>

              <Menu.Item
                name='chargers'
                active={activeItem === 'topCharger'}
                onClick={() => { history.push('/xleaderboard/chargers')}}
              >
                <img style={wpnIcon} src={chargerIcon} alt="Charger Icon"/>
                Chargers
              </Menu.Item>
            
            </Menu>
            <Menu compact icon='labeled'>

              <Menu.Item
                name='splatlings'
                active={activeItem === 'topSplatling'}
                onClick={() => { history.push('/xleaderboard/splatlings')}}
              >
                <img style={wpnIcon} src={splatlingIcon} alt="Splatling Icon"/>
                Splatlings
              </Menu.Item>

              <Menu.Item
                name='sloshers'
                active={activeItem === 'topSlosher'}
                onClick={() => { history.push('/xleaderboard/sloshers')}}
              >
                <img style={wpnIcon} src={slosherIcon} alt="Slosher Icon"/>
                Sloshers
              </Menu.Item>

              <Menu.Item
                name='dualies'
                active={activeItem === 'topDualies'}
                onClick={() => { history.push('/xleaderboard/dualies')}}
              >
                <img style={wpnIcon} src={dualieIcon} alt="Dualie Icon"/>
                Dualies
              </Menu.Item>

              <Menu.Item
                name='brella'
                active={activeItem === 'topBrella'}
                onClick={() => { history.push('/xleaderboard/brellas')}}
              >
                <img style={wpnIcon} src={brellaIcon} alt="Brella Icon"/>
                Brellas
              </Menu.Item>
            </Menu>
          </Responsive>
        </div>
      </div>
      <Route exact path="/xleaderboard" render={() =>
        <WeaponLeaderboard 
          query={topTotalPlayers}
          queryName="topTotalPlayers"
          scoreField="topTotalScore"
          weaponsField="topTotal"
          setActiveItem={setActiveItem}
        />
        } 
      />
      <Route exact path="/xleaderboard/shooters" render={() =>
        <WeaponLeaderboard 
          query={topShooterPlayers}
          queryName="topShooterPlayers"
          scoreField="topShooterScore"
          weaponsField="topShooter"
          setActiveItem={setActiveItem}
        />
        } 
      />
      <Route exact path="/xleaderboard/blasters" render={() =>
        <WeaponLeaderboard 
          query={topBlasterPlayers}
          queryName="topBlasterPlayers"
          scoreField="topBlasterScore"
          weaponsField="topBlaster"
          setActiveItem={setActiveItem}
        />
        } 
      />
      <Route exact path="/xleaderboard/rollers" render={() =>
        <WeaponLeaderboard 
          query={topRollerPlayers}
          queryName="topRollerPlayers"
          scoreField="topRollerScore"
          weaponsField="topRoller"
          setActiveItem={setActiveItem}
        />
        } 
      />
      <Route exact path="/xleaderboard/chargers" render={() =>
        <WeaponLeaderboard 
          query={topChargerPlayers}
          queryName="topChargerPlayers"
          scoreField="topChargerScore"
          weaponsField="topCharger"
          setActiveItem={setActiveItem}
        />
        } 
      />
      <Route exact path="/xleaderboard/splatlings" render={() =>
        <WeaponLeaderboard 
          query={topSplatlingPlayers}
          queryName="topSplatlingPlayers"
          scoreField="topSplatlingScore"
          weaponsField="topSplatling"
          setActiveItem={setActiveItem}
        />
        } 
      />
      <Route exact path="/xleaderboard/sloshers" render={() =>
        <WeaponLeaderboard 
          query={topSlosherPlayers}
          queryName="topSlosherPlayers"
          scoreField="topSlosherScore"
          weaponsField="topSlosher"
          setActiveItem={setActiveItem}
        />
        } 
      />
      <Route exact path="/xleaderboard/dualies" render={() =>
        <WeaponLeaderboard 
          query={topDualiesPlayers}
          queryName="topDualiesPlayers"
          scoreField="topDualiesScore"
          weaponsField="topDualies"
          setActiveItem={setActiveItem}
        />
        } 
      />
      <Route exact path="/xleaderboard/brellas" render={() =>
        <WeaponLeaderboard 
          query={topBrellaPlayers}
          queryName="topBrellaPlayers"
          scoreField="topBrellaScore"
          weaponsField="topBrella"
          setActiveItem={setActiveItem}
        />
        } 
      />
    </div>
  )
})

export default WeaponLeaderboardSelector