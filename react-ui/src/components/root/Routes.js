import React, { Suspense, lazy } from "react"
import { Route, Switch } from "react-router-dom"
import Loading from "../common/Loading"

const MapListGenerator = lazy(() => import("../maps/MapListGenerator"))
const Rotations = lazy(() => import("../rotation/Rotations"))
const MapPlanner = lazy(() => import("../plans/MapPlanner"))
const Calendar = lazy(() => import("../calendar/Calendar"))
const XLeaderboard = lazy(() => import("../xleaderboard/XLeaderboard"))
const PlayerXRankStats = lazy(() => import("../xsearch/PlayerXRankStats"))
const XTrends = lazy(() => import("../xtrends/XTrends"))
const Links = lazy(() => import("../links/Links"))
const TournamentDetailsPage = lazy(() =>
  import("../tournament/TournamentDetailsPage")
)
const TournamentSearchPage = lazy(() =>
  import("../tournament/TournamentSearchPage")
)

const Routes = () => {
  return (
    <Suspense fallback={<Loading />}>
      <Switch>
        <Route path="/maps">
          <MapListGenerator />
        </Route>
        <Route path="/rotation">
          <Rotations />
        </Route>
        <Route path="/plans">
          <MapPlanner />
        </Route>
        <Route path="/calendar">
          <Calendar />
        </Route>
        <Route path="/links">
          <Links />
        </Route>
        <Route path="/xleaderboard">
          <XLeaderboard />
        </Route>
        <Route path="/xsearch/p/:uid">
          <PlayerXRankStats />
        </Route>
        <Route path="/trends">
          <XTrends />
        </Route>
        <Route exact path="/tournaments">
          <TournamentSearchPage />
        </Route>
        <Route path="/tournaments/:id/:weapons?">
          <TournamentDetailsPage />
        </Route>
      </Switch>
    </Suspense>
  )
}

export default Routes
