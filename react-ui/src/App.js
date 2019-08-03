import React, { useState } from 'react'
import { Container } from 'semantic-ui-react'
import Footer from './components/Misc/Footer'
import MainMenu from './components/Misc/MainMenu'
import NotFound from './components/Misc/NotFound'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'

import WeaponLeaderboardSelector from './components/XLeaderboard/WeaponLeaderboardSelector'
import XSearch from './components/XSearch/XSearch'
import InfoPlayer from './components/XSearch/InfoPlayer'
import InfoWeapon from './components/XSearch/InfoWeapon'
import ScrollToTop from './utils/ScrollToTop'
import MapListGenerator from './components/Tools/MapListGenerator'
import Rotations from './components/Tools/Rotations'
import MapPlanner from './components/Tools/MapPlanner'
import Links from './components/Misc/Links'
import UserPage from './components/SoloLadder/UserPage'
import HomePage from './components/Misc/HomePage'
import BuildSearch from './components/SoloLadder/BuildSearch'
import Admin from './components/Misc/Admin'
import Calendar from './components/Tools/Calendar'
import XTrends from './components/XSearch/XTrends'

const App = () => {
  const [menuSelection, setMenuSelection] = useState('home')
  return (
    <div>
    <Router>
      <Container>
          <MainMenu menuSelection={menuSelection} setMenuSelection={setMenuSelection} />
          <div>
            <ScrollToTop />
            <Switch>
              <Route exact path="/" render={() => <HomePage setMenuSelection={setMenuSelection} />} />
              <Route path="/xleaderboard" render={() => <WeaponLeaderboardSelector setMenuSelection={setMenuSelection} />} />
              <Route exact path="/xsearch" render={() => <XSearch setMenuSelection={setMenuSelection} />} />
              <Route exact path="/xsearch/w/:wpn" render={({ match }) =>
                <InfoWeapon wpn={match.params.wpn.replace(/-/g, '_')} />
              } />
              <Route exact path="/xsearch/p/:uid" render={({ match }) =>
                <InfoPlayer uid={match.params.uid} setMenuSelection={setMenuSelection} />
              } />
              <Route exact path="/maps" render={() => 
                <MapListGenerator setMenuSelection={setMenuSelection} />
              } />
              <Route exact path="/rotation" render={() => 
                <Rotations setMenuSelection={setMenuSelection} />
              } />
              <Route exact path="/links" render={() => 
                <Links setMenuSelection={setMenuSelection} />
              } />
              <Route exact path="/u/:user" render={({ match }) => 
                <UserPage userIdOrName={match.params.user}/>
              } />
              <Route exact path="/builds" render={() => 
                <BuildSearch setMenuSelection={setMenuSelection} />
              } />
              <Route exact path="/builds/:weapon" render={({ match }) => 
                <BuildSearch 
                  setMenuSelection={setMenuSelection} 
                  weaponFromUrl={match.params.weapon.replace(/_/g, ' ')} 
                />
              } />
              <Route exact path="/plans" render={() => 
                <MapPlanner 
                  setMenuSelection={setMenuSelection} 
                />
              } />
              <Route exact path="/calendar" render={() => 
                <Calendar 
                  setMenuSelection={setMenuSelection} 
                />
              } />
              <Route exact path="/trends" render={() => 
                <XTrends 
                  setMenuSelection={setMenuSelection} 
                />
              } />
              <Route path="/404" render={() => <NotFound />} />
              <Route path="/admin" render={() => <Admin />} />
              <Route path="*" render={() => <NotFound />} />
            </Switch>
          </div>
          <Footer />
        </Container>
    </Router>
    </div>
  )
}

export default App
