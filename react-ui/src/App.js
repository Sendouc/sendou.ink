import React from 'react'
import { Container } from 'semantic-ui-react'
import Footer from './components/Footer'
import { BrowserRouter as Router, Route } from 'react-router-dom'

import WeaponLeaderboardSelector from './components/WeaponLeaderboardSelector'

const App = () => {
  return (
    <div>
    <Router>
      <Container>
        <div>
          <Route path="/xleaderboard" render={() => <WeaponLeaderboardSelector />} />
        </div>
        <Footer />
      </Container>
    </Router>
    </div>
  )
}

export default App
