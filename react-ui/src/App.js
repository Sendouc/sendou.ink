import React, { useState } from 'react'
import { Container } from 'semantic-ui-react'
import Footer from './components/Footer'
import MainMenu from './components/MainMenu'
import { BrowserRouter as Router, Route } from 'react-router-dom'

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
          <Route path="/xleaderboard" render={() => <WeaponLeaderboardSelector setMenuSelection={setMenuSelection} />} />
          <Route path="/xsearch" render={() => <XSearch setMenuSelection={setMenuSelection} />} />
        </div>
        <Footer />
      </Container>
    </Router>
    </div>
  )
}

export default App
