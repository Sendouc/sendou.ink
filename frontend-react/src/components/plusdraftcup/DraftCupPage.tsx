import React, { useContext } from "react"
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
import { Box } from "@chakra-ui/core"
import MyThemeContext from "../../themeContext"

const DraftCupPage: React.FC<RouteComponentProps> = () => {
  const { grayWithShade } = useContext(MyThemeContext)
  const { data, error, loading } = useQuery<PlusDraftCupsData>(PLUS_DRAFT_CUPS)

  if (error) return <Error errorMessage={error.message} />
  if (loading) return <Loading />

  return (
    <>
      <Helmet>
        <title>Draft Cup Home | sendou.ink</title>
      </Helmet>
      <PageHeader title="Plus Server Draft Cups" />
      <Box color={grayWithShade}>
        Draft Cup is a tournament series open for +1 and +2 members. On this
        page you can browse the leaderboards and detailed match reports.
      </Box>

      <DraftTournamentCards tournaments={data!.plusDraftCups.tournaments} />
      <Box mt="1em">
        <DraftLeaderboard leaderboards={data!.plusDraftCups.leaderboards} />
      </Box>
    </>
  )
}

export default DraftCupPage
