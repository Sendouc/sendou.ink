import React, { Suspense, lazy } from "react"
import { Route, Switch } from "react-router-dom"
import Loading from "../common/Loading"

const MapListGenerator = lazy(() => import("../maps/MapListGenerator"))
const Rotations = lazy(() => import("../rotation/Rotations"))
const MapPlanner = lazy(() => import("../plans/MapPlanner"))
const Calendar = lazy(() => import("../calendar/Calendar"))
const XLeaderboard = lazy(() => import("../xleaderboard/XLeaderboard"))

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
        <Route path="/xleaderboard">
          <XLeaderboard />
        </Route>
      </Switch>
    </Suspense>
  )
}

export default Routes
