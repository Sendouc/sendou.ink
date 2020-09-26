import { Router } from "@reach/router"
import React, { lazy, Suspense } from "react"
import Loading from "../common/Loading"
import NotFound from "./NotFound"
import { ScrollToTop } from "./ScrollToTop"

const HomePage = lazy(() => import("../home/HomePage"))
const UserPage = lazy(() => import("../user/UserPage"))
const UserSearchPage = lazy(() => import("../usersearch/UserSearchPage"))
const MarkdownHelpPage = lazy(() => import("../markdown/MarkdownHelpPage"))
const BuildsPage = lazy(() => import("../builds/BuildsPage"))
const BuildAnalyzerPage = lazy(() => import("../analyzer/BuildAnalyzerPage"))
const CalendarPage = lazy(() => import("../calendar/CalendarPage"))
const TournamentsPage = lazy(() => import("../tournaments/TournamentsPage"))
const EventPage = lazy(() => import("../events/EventsPage"))
const TournamentsDetailsPage = lazy(
  () => import("../tournaments/TournamentDetailsPage")
)
const MapPlannerPage = lazy(() => import("../plans/MapPlannerPage"))
const FreeAgentsPage = lazy(() => import("../freeagents/FreeAgentsPage"))
const TeamPage = lazy(() => import("../team/TeamPage"))
const XSearch = lazy(() => import("../xsearch/Top500BrowserPage"))
const XTrends = lazy(() => import("../xtrends/XTrendsPage"))
const PlusPage = lazy(() => import("../plus/PlusPage"))
const PlusFAQPage = lazy(() => import("../plus/PlusFAQPage"))
const DraftCupPage = lazy(() => import("../plusdraftcup/DraftCupPage"))
const DraftCupDetails = lazy(() => import("../plusdraftcup/DraftCupDetails"))
const Access = lazy(() => import("./Access"))
const VotingHistoryPage = lazy(() => import("../plus/VotingHistoryPage"))
const About = lazy(() => import("./About"))
const Links = lazy(() => import("./Links"))
const TranslatePage = lazy(() => import("../translate/TranslatePage"))
const AdminPage = lazy(() => import("../admin/AdminPage"))

const Routes: React.FC = () => {
  return (
    <Suspense fallback={<Loading />}>
      <Router>
        <ScrollToTop path="/">
          <HomePage path="/" />
          <AdminPage path="/admin" />
          <TranslatePage path="/translate" />
          <UserPage path="/u/:id" />
          <UserSearchPage path="/u" />
          <MarkdownHelpPage path="/markdown" />
          <TeamPage path="/t/:name" />
          <BuildsPage path="/builds" />
          <BuildAnalyzerPage path="/analyzer" />
          <EventPage path="/event" />
          <MapPlannerPage path="/plans" />
          <CalendarPage path="/calendar" />
          <TournamentsPage path="/tournaments" />
          <TournamentsDetailsPage path="/tournaments/:id" />
          <FreeAgentsPage path="/freeagents" />
          <XSearch path="/xsearch" />
          <XTrends path="/xtrends" />
          <About path="/about" />
          <Links path="/links" />
          <Access path="/access" />
          <PlusPage path="/plus" />
          <DraftCupPage path="/draft" />
          <DraftCupDetails path="/draft/:id" />
          <VotingHistoryPage path="/plus/history" />
          <PlusFAQPage path="/plus/faq" />
          <NotFound default />
        </ScrollToTop>
      </Router>
    </Suspense>
  )
}

export default Routes
