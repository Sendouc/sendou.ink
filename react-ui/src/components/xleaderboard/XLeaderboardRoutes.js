import React from "react"
import { Route } from "react-router-dom"
import WeaponLeaderboard from "./WeaponLeaderboard"
import { topTotalPlayers } from "../../graphql/queries/topPlayers"
import { topShooterPlayers } from "../../graphql/queries/topShooters"
import { topBlasterPlayers } from "../../graphql/queries/topBlasters"
import { topBrellaPlayers } from "../../graphql/queries/topBrellas"
import { topChargerPlayers } from "../../graphql/queries/topChargers"
import { topDualiesPlayers } from "../../graphql/queries/topDualies"
import { topRollerPlayers } from "../../graphql/queries/topRollers"
import { topSlosherPlayers } from "../../graphql/queries/topSloshers"
import { topSplatlingPlayers } from "../../graphql/queries/topSplatlings"
import FlexLeaderboard from "./FlexLeaderboard"

const XLeaderboardRoutes = () => {
  return (
    <>
      <Route
        exact
        path="/xleaderboard"
        render={() => (
          <WeaponLeaderboard
            query={topTotalPlayers}
            queryName="topTotalPlayers"
            scoreField="topTotalScore"
            weaponsField="topTotal"
          />
        )}
      />
      <Route
        exact
        path="/xleaderboard/flex"
        render={() => <FlexLeaderboard />}
      />
      <Route
        exact
        path="/xleaderboard/shooters"
        render={() => (
          <WeaponLeaderboard
            query={topShooterPlayers}
            queryName="topShooterPlayers"
            scoreField="topShooterScore"
            weaponsField="topShooter"
          />
        )}
      />
      <Route
        exact
        path="/xleaderboard/blasters"
        render={() => (
          <WeaponLeaderboard
            query={topBlasterPlayers}
            queryName="topBlasterPlayers"
            scoreField="topBlasterScore"
            weaponsField="topBlaster"
          />
        )}
      />
      <Route
        exact
        path="/xleaderboard/rollers"
        render={() => (
          <WeaponLeaderboard
            query={topRollerPlayers}
            queryName="topRollerPlayers"
            scoreField="topRollerScore"
            weaponsField="topRoller"
          />
        )}
      />
      <Route
        exact
        path="/xleaderboard/chargers"
        render={() => (
          <WeaponLeaderboard
            query={topChargerPlayers}
            queryName="topChargerPlayers"
            scoreField="topChargerScore"
            weaponsField="topCharger"
          />
        )}
      />
      <Route
        exact
        path="/xleaderboard/splatlings"
        render={() => (
          <WeaponLeaderboard
            query={topSplatlingPlayers}
            queryName="topSplatlingPlayers"
            scoreField="topSplatlingScore"
            weaponsField="topSplatling"
          />
        )}
      />
      <Route
        exact
        path="/xleaderboard/sloshers"
        render={() => (
          <WeaponLeaderboard
            query={topSlosherPlayers}
            queryName="topSlosherPlayers"
            scoreField="topSlosherScore"
            weaponsField="topSlosher"
          />
        )}
      />
      <Route
        exact
        path="/xleaderboard/dualies"
        render={() => (
          <WeaponLeaderboard
            query={topDualiesPlayers}
            queryName="topDualiesPlayers"
            scoreField="topDualiesScore"
            weaponsField="topDualies"
          />
        )}
      />
      <Route
        exact
        path="/xleaderboard/brellas"
        render={() => (
          <WeaponLeaderboard
            query={topBrellaPlayers}
            queryName="topBrellaPlayers"
            scoreField="topBrellaScore"
            weaponsField="topBrella"
          />
        )}
      />
    </>
  )
}

export default XLeaderboardRoutes
