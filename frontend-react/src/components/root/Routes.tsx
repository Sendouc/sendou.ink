import React, { Suspense, lazy } from "react"
import { Router } from "@reach/router"
import Loading from "../common/Loading"

const HomePage = lazy(() => import("../home/HomePage"))
const UserPage = lazy(() => import("../user/UserPage"))
const BuildsPage = lazy(() => import("../builds/BuildsPage"))
const CalendarPage = lazy(() => import("../calendar/CalendarPage"))
const MapPlannerPage = lazy(() => import("../plans/MapPlannerPage"))
const FreeAgentsPage = lazy(() => import("../freeagents/FreeAgentsPage"))
const TeamPage = lazy(() => import("../team/TeamPage"))

const Routes: React.FC = () => {
  return (
    <Suspense fallback={<Loading />}>
      <Router>
        <HomePage path="/" />
        <UserPage path="/u/:id" />
        <TeamPage path="/t/:name" />
        <BuildsPage path="/builds" />
        <MapPlannerPage path="/plans" />
        <CalendarPage path="/calendar" />
        <FreeAgentsPage path="/freeagents" />
        <HomePage default />
      </Router>
    </Suspense>
  )
}

export default Routes
