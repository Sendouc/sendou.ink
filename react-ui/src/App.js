import React, { useState, Suspense, lazy } from "react"
import { Container } from "semantic-ui-react"
import { Spin } from "antd"
import Footer from "./components/Misc/Footer"
import MainMenu from "./components/Misc/MainMenu"
import NotFound from "./components/Misc/NotFound"
import { BrowserRouter as Router, Route, Switch } from "react-router-dom"

import PageXLeaderboard from "./components/XLeaderboard/PageXLeaderboard"
import PageXBrowser from "./components/XRank/PageXBrowser"
import InfoPlayer from "./components/XSearch/InfoPlayer"
import ScrollToTop from "./utils/ScrollToTop"
import PageMapListGenerator from "./components/Tools/PageMapListGenerator"
import PageRotations from "./components/Tools/PageRotations"
import Links from "./components/Misc/Links"
import UserPage from "./components/SoloLadder/UserPage"
import PageHome from "./components/Misc/PageHome"
import PageBuilds from "./components/Tools/PageBuilds"
import Admin from "./components/Misc/Admin"
import Calendar from "./components/Tools/PageCalendar"
import About from "./components/Misc/PageAbout"

const XTrends = lazy(() => import("./components/XSearch/XTrends"))
const PageMapPlanner = lazy(() => import("./components/Tools/PageMapPlanner"))

const SuspensefulComponent = ({ component }) => {
  return (
    <Suspense
      fallback={
        <div style={{ textAlign: "center" }}>
          <Spin />
        </div>
      }
    >
      {component}
    </Suspense>
  )
}

const App = () => {
  const [menuSelection, setMenuSelection] = useState("home")
  return (
    <Router>
      <Container>
        <MainMenu
          menuSelection={menuSelection}
          setMenuSelection={setMenuSelection}
        />
        <ScrollToTop />
        <Switch>
          <Route
            exact
            path="/"
            render={() => <PageHome setMenuSelection={setMenuSelection} />}
          />
          <Route
            path="/xleaderboard"
            render={() => (
              <PageXLeaderboard setMenuSelection={setMenuSelection} />
            )}
          />
          <Route
            exact
            path="/xsearch"
            render={() => <PageXBrowser setMenuSelection={setMenuSelection} />}
          />
          <Route
            exact
            path="/xsearch/p/:uid"
            render={({ match }) => (
              <InfoPlayer
                uid={match.params.uid}
                setMenuSelection={setMenuSelection}
              />
            )}
          />
          <Route
            exact
            path="/maps"
            render={() => (
              <PageMapListGenerator setMenuSelection={setMenuSelection} />
            )}
          />
          <Route
            exact
            path="/rotation"
            render={() => <PageRotations setMenuSelection={setMenuSelection} />}
          />
          <Route
            exact
            path="/links"
            render={() => <Links setMenuSelection={setMenuSelection} />}
          />
          <Route
            exact
            path="/u/:user"
            render={({ match }) => (
              <UserPage userIdOrName={match.params.user} />
            )}
          />
          <Route
            exact
            path="/builds"
            render={() => <PageBuilds setMenuSelection={setMenuSelection} />}
          />
          <Route
            exact
            path="/builds/:weapon"
            render={({ match }) => (
              <PageBuilds
                setMenuSelection={setMenuSelection}
                weaponFromUrl={match.params.weapon.replace(/_/g, " ")}
              />
            )}
          />
          <Route
            exact
            path="/calendar"
            render={() => <Calendar setMenuSelection={setMenuSelection} />}
          />
          <Route
            exact
            path="/plans"
            render={() => (
              <SuspensefulComponent
                component={
                  <PageMapPlanner setMenuSelection={setMenuSelection} />
                }
              />
            )}
          />
          <Route
            exact
            path="/trends"
            render={() => (
              <SuspensefulComponent
                component={<XTrends setMenuSelection={setMenuSelection} />}
              />
            )}
          />
          <Route path="/about" render={() => <About />} />
          <Route path="/admin" render={() => <Admin />} />
          <Route path="/404" render={() => <NotFound />} />
          <Route path="*" render={() => <NotFound />} />
        </Switch>
        <Footer />
      </Container>
    </Router>
  )
}

export default App
