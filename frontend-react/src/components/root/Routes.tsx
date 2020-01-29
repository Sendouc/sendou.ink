import React, { Suspense, lazy } from "react"
import { Router } from "@reach/router"
import Loading from "../common/Loading"
import MapPlannerPage from "../plans/MapPlannerPage"
import CalendarPage from "../../calendar/CalendarPage"

const HomePage = lazy(() => import("../home/HomePage"))
const UserPage = lazy(() => import("../user/UserPage"))
const BuildsPage = lazy(() => import("../builds/BuildsPage"))

const Routes: React.FC = () => {
  return (
    <Suspense fallback={<Loading />}>
      <Router>
        <HomePage path="/" />
        <UserPage path="/u/:id" />
        <BuildsPage path="/builds" />
        <MapPlannerPage path="/plans" />
        <CalendarPage path="/calendar" />
      </Router>
    </Suspense>
  )
}

export default Routes
