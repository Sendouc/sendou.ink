import { RouteComponentProps } from "@reach/router"
import React from "react"
import { useGetPeakXPowerLeaderboardQuery } from "../../generated/graphql"
import PageHeader from "../common/PageHeader"

const XLeaderboardsPage: React.FC<RouteComponentProps> = ({}) => {
  const { data } = useGetPeakXPowerLeaderboardQuery()

  console.log("data", data?.getPeakXPowerLeaderboard.records)
  return <PageHeader title="X Leaderboards" />
}

export default XLeaderboardsPage
