import React from "react"
import { RouteComponentProps } from "@reach/router"
import PageHeader from "../common/PageHeader"
import { useQuery } from "@apollo/react-hooks"
import {
  PlusDraftCupsData,
  PLUS_DRAFT_CUPS,
} from "../../graphql/queries/plusDraftCups"
import Error from "../common/Error"
import Loading from "../common/Loading"
import DraftLeaderboard from "./DraftLeaderboard"
import { Helmet } from "react-helmet-async"
import DraftTournamentCards from "./DraftTournamentCards"

const DraftCupPage: React.FC<RouteComponentProps> = () => {
  const { data, error, loading } = useQuery<PlusDraftCupsData>(PLUS_DRAFT_CUPS)

  if (error) return <Error errorMessage={error.message} />
  if (loading) return <Loading />

  return (
    <>
      <Helmet>
        <title>Draft Cup Home | sendou.ink</title>
      </Helmet>
      <PageHeader title="Plus Server Draft Cups" />
      <DraftTournamentCards tournaments={data!.plusDraftCups.tournaments} />
      <DraftLeaderboard leaderboards={data!.plusDraftCups.leaderboards} />
    </>
  )
}

export default DraftCupPage
