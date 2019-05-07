import React, { useState } from 'react'
import { Container } from 'semantic-ui-react'
import Footer from './components/Footer'
import MainMenu from './components/MainMenu'
import NotFound from './components/NotFound'
import { BrowserRouter as Router, Route, Redirect, Switch } from 'react-router-dom'

import WeaponLeaderboardSelector from './components/WeaponLeaderboardSelector'
import XSearch from './components/XSearch'

const App = () => {
  const [menuSelection, setMenuSelection] = useState('home')
  return (
    <div>
    <Router>
      <Container>
          <MainMenu menuSelection={menuSelection} setMenuSelection={setMenuSelection} />
          <div>
            <Switch>
              <Route exact path="/" render={() => <div>This is home.</div>} />
              <Route path="/xleaderboard" render={() => <WeaponLeaderboardSelector setMenuSelection={setMenuSelection} />} />
              <Route path="/xsearch" render={() => <XSearch setMenuSelection={setMenuSelection} />} />
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
