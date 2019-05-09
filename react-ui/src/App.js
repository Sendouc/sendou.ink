import React, { useState } from 'react'
import { Container } from 'semantic-ui-react'
import Footer from './components/Footer'
import MainMenu from './components/MainMenu'
import NotFound from './components/NotFound'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'

import WeaponLeaderboardSelector from './components/WeaponLeaderboardSelector'
import XSearch from './components/XSearch'
import InfoPlayer from './components/InfoPlayer'
import InfoWeapon from './components/InfoWeapon'
import ScrollToTop from './utils/ScrollToTop'

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
              <Route exact path="/" render={() => <div>This is home.</div>} />
              <Route path="/xleaderboard" render={() => <WeaponLeaderboardSelector setMenuSelection={setMenuSelection} />} />
              <Route exact path="/xsearch" render={() => <XSearch setMenuSelection={setMenuSelection} />} />
              <Route exact path="/xsearch/w/:wpn" render={({ match }) =>
                <InfoWeapon wpn={match.params.wpn.replace(/-/g, '_')} />
              } />
              <Route exact path="/xsearch/p/:uid" render={({ match }) =>
                <InfoPlayer uid={match.params.uid} setMenuSelection={setMenuSelection} />
              } />
              <Route path="/404" render={() => <NotFound />} />
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
