import React, { Suspense, lazy } from "react"
import { Route, Switch } from "react-router-dom"
import Loading from "../common/Loading"
import NotFound from "../common/NotFound"

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
        <Route path="/tournaments/:id">
          <TournamentDetailsPage />
        </Route>
        <Route path="/404" render={() => <NotFound />} />
        <Route path="*" render={() => <NotFound />} />
      </Switch>
    </Suspense>
  )
}

export default Routes
