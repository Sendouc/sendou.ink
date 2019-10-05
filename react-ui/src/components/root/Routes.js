import React, { Suspense, lazy } from "react"
import { Route, Switch } from "react-router-dom"
import Loading from "../common/Loading"

const MapListGenerator = lazy(() => import("../maps/MapListGenerator"))
const Rotations = lazy(() => import("../rotation/Rotations"))

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
      </Switch>
    </Suspense>
  )
}

export default Routes
