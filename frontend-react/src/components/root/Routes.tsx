import React, { Suspense, lazy } from "react"
import { Router } from "@reach/router"
import Loading from "../common/Loading"
import NotFound from "./NotFound"
import { ScrollToTop } from "./ScrollToTop"
import AdminPage from "../admin/AdminPage"

const HomePage = lazy(() => import("../home/HomePage"))
const UserPage = lazy(() => import("../user/UserPage"))
const BuildsPage = lazy(() => import("../builds/BuildsPage"))
const CalendarPage = lazy(() => import("../calendar/CalendarPage"))
const TournamentsPage = lazy(() => import("../tournaments/TournamentsPage"))
const TournamentsDetailsPage = lazy(() =>
  import("../tournaments/TournamentDetailsPage")
)
const MapPlannerPage = lazy(() => import("../plans/MapPlannerPage"))
const FreeAgentsPage = lazy(() => import("../freeagents/FreeAgentsPage"))
const TeamPage = lazy(() => import("../team/TeamPage"))
const XSearch = lazy(() => import("../xsearch/Top500BrowserPage"))
const PlusPage = lazy(() => import("../plus/PlusPage"))
const DraftCupPage = lazy(() => import("../plusdraftcup/DraftCupPage"))
const DraftCupDetails = lazy(() => import("../plusdraftcup/DraftCupDetails"))
const Access = lazy(() => import("./Access"))
const VotingHistoryPage = lazy(() => import("../plus/VotingHistoryPage"))
const MapVotingHistoryPage = lazy(() => import("../plus/MapVotingHistoryPage"))
const MapVoting = lazy(() => import("../plus/MapVoting"))
const About = lazy(() => import("./About"))
const Links = lazy(() => import("./Links"))

const Routes: React.FC = () => {
  return (
    <Suspense fallback={<Loading />}>
      <Router>
        <ScrollToTop path="/">
          <HomePage path="/" />
          <AdminPage path="/admin" />
          <UserPage path="/u/:id" />
          <TeamPage path="/t/:name" />
          <BuildsPage path="/builds" />
          <MapPlannerPage path="/plans" />
          <CalendarPage path="/calendar" />
          <TournamentsPage path="/tournaments" />
          <TournamentsDetailsPage path="/tournaments/:id" />
          <FreeAgentsPage path="/freeagents" />
          <XSearch path="/xsearch" />
          <About path="/about" />
          <Links path="/links" />
          <Access path="/access" />
          <PlusPage path="/plus" />
          <DraftCupPage path="/plus/draft" />
          <DraftCupDetails path="/plus/draft/:id" />
          <VotingHistoryPage path="/plus/history" />
          <MapVotingHistoryPage path="/plus/maphistory" />
          <MapVoting path="/plus/mapvoting" />
          <NotFound default />
        </ScrollToTop>
      </Router>
    </Suspense>
  )
}

export default Routes
