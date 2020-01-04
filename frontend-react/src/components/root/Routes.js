import React, { Suspense, lazy } from "react"
import { Route, Switch } from "react-router-dom"
import Loading from "../common/Loading"
import NotFound from "../common/NotFound"
import Page from "./Page"

const HomePage = lazy(() => import("../root/HomePage"))
const MapListGenerator = lazy(() => import("../maps/MapListGenerator"))
const Rotations = lazy(() => import("../rotation/Rotations"))
const MapPlanner = lazy(() => import("../plans/MapPlanner"))
const Calendar = lazy(() => import("../calendar/Calendar"))
const XLeaderboard = lazy(() => import("../xleaderboard/XLeaderboard"))
const PlayerXRankStats = lazy(() => import("../xsearch/PlayerXRankStats"))
const XTrends = lazy(() => import("../xtrends/XTrends"))
const Top500Browser = lazy(() => import("../xsearch/Top500Browser"))
const Links = lazy(() => import("../links/Links"))
const TournamentDetailsPage = lazy(() =>
  import("../tournament/TournamentDetailsPage")
)
const TournamentSearchPage = lazy(() =>
  import("../tournament/TournamentSearchPage")
)
const BuildsBrowser = lazy(() => import("../builds/BuildsBrowser"))
const FreeAgentBrowser = lazy(() => import("../freeagents/FreeAgentBrowser"))
const PlusPage = lazy(() => import("../plus/PlusPage"))
const PlusFAQ = lazy(() => import("../plus/PlusFAQ"))
const UserPage = lazy(() => import("../user/UserPage"))
const InfoPage = lazy(() => import("./InfoPage"))
const AdminPanel = lazy(() => import("../admin/AdminPanel"))
const PleaseLogIn = lazy(() => import("../common/PleaseLogIn"))

const Routes = () => {
  return (
    <Suspense fallback={<Loading />}>
      <Switch>
        <Route exact path="/">
          <Page>
            <HomePage />
          </Page>
        </Route>
        <Route path="/maps">
          <Page
            title="Map list generator"
            subtitle="Generate a map list to use while scrimming. Use exactly the map pool you are practicing right now. Also check out the .maps command with Lohi on Discord!"
            icon="sync"
          >
            <MapListGenerator />
          </Page>
        </Route>
        <Route path="/rotation">
          <Page
            title="Rotations"
            subtitle="Current and upcoming solo queue and league battle rotations. Also check out the .rot command with Lohi on Discord!"
            icon="sync"
          >
            <Rotations />
          </Page>
        </Route>
        <Route path="/plans">
          <Page
            title="Map planner"
            subtitle="Draw on maps with various tools and make your perfect battle plan."
            icon="pencil square"
          >
            <MapPlanner />
          </Page>
        </Route>
        <Route path="/calendar">
          <Page
            title="Competitive calendar"
            subtitle="Upcoming events around competitive Splatoon. Managed by Kbot."
            icon="calendar alternate"
          >
            <Calendar />
          </Page>
        </Route>
        <Route path="/links">
          <Page
            title="Links"
            subtitle="Useful Splatoon resources from all over."
            icon="linkify"
          >
            <Links />
          </Page>
        </Route>
        <Route path="/xleaderboard">
          <Page
            title="X Rank leaderboards"
            subtitle="Best players of X Rank by weapon class. Criteria used is top 4 X Powers."
            icon="chess king"
          >
            <XLeaderboard />
          </Page>
        </Route>
        <Route exact path="/xsearch">
          <Page
            title="X Rank search"
            subtitle="Browser through all the X Rank top 500 placements of the past with whatever filter you can think of."
            icon="list"
          >
            <Top500Browser />
          </Page>
        </Route>
        <Route path="/xsearch/p/:uid">
          <Page>
            <PlayerXRankStats />
          </Page>
        </Route>
        <Route path="/trends">
          <Page
            title="X Rank trends"
            subtitle="Compare weapons based on their X Rank top 500 appearances. Combine weapons to see for example how the popularity of blasters as a class has changed over time."
            icon="line graph"
          >
            <XTrends />
          </Page>
        </Route>
        <Route exact path="/tournaments">
          <Page
            title="Tournaments"
            subtitle="Browser through tournaments of the past. Search for a team comp to see how it has fared in the past. Find your favorite player or team."
            icon="trophy"
          >
            <TournamentSearchPage />
          </Page>
        </Route>
        <Route path="/tournaments/:id">
          <Page title="Tournaments" subtitle="" icon="th">
            <TournamentDetailsPage />
          </Page>
        </Route>
        <Route path="/builds">
          <Page
            title="Builds"
            subtitle="Search for a weapon and find out what kind of builds people are running. Players who have reached top 500 with the weapon in question are listed first."
            icon="th"
          >
            <BuildsBrowser />
          </Page>
        </Route>
        <Route path="/freeagents">
          <Page
            title="Free agents"
            subtitle="Discover the next best teammate of yours! Currently not in a team? Don't hesitate to make a free agent post."
            icon="spy"
          >
            <FreeAgentBrowser />
          </Page>
        </Route>
        <Route path="/u/:id">
          <Page>
            <UserPage />
          </Page>
        </Route>
        <Route exact path="/plus">
          <Page
            title="Plus servers home"
            subtitle="Grab a link to rejoin the server. Suggest or vouch new players. Vote in the monthly votings."
            icon="plus"
          >
            <PlusPage />
          </Page>
        </Route>
        <Route exact path="/plus/faq">
          <Page
            title="Plus servers FAQ"
            subtitle="Answering questions you might have about the plus servers. Feel free to ask if the below leaves you wondering."
            icon="question circle"
          >
            <PlusFAQ />
          </Page>
        </Route>
        <Route path="/about">
          <Page
            title="Information about this website"
            subtitle="Thank you for visiting sendou.ink! Special shout-outs to the people below who helped in making this site."
            icon="info"
          >
            <InfoPage />
          </Page>
        </Route>
        <Route path="/admin">
          <Page>
            <AdminPanel />
          </Page>
        </Route>
        <Route path="/access">
          <Page>
            <PleaseLogIn />
          </Page>
        </Route>
        <Route
          path="/404"
          render={() => (
            <Page>
              <NotFound />
            </Page>
          )}
        />
        <Route
          path="*"
          render={() => (
            <Page>
              <NotFound />
            </Page>
          )}
        />
      </Switch>
    </Suspense>
  )
}

export default Routes
