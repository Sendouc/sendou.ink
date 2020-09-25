import { RouteComponentProps } from "@reach/router"
import React from "react"
import PageHeader from "../common/PageHeader"
import { PeakXPowerLeaderboard } from "./PeakXPowerLeaderboard"

const XLeaderboardsPage: React.FC<RouteComponentProps> = ({}) => {
  return (
    <>
      <PageHeader title="X Leaderboards" />
      <PeakXPowerLeaderboard />
    </>
  )
}

export default XLeaderboardsPage
