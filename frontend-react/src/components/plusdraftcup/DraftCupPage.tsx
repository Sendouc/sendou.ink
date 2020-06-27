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
import { useTranslation } from "react-i18next"

const DraftCupPage: React.FC<RouteComponentProps> = () => {
  const { t } = useTranslation()
  const { grayWithShade } = useContext(MyThemeContext)
  const { data, error, loading } = useQuery<PlusDraftCupsData>(PLUS_DRAFT_CUPS)

  if (error) return <Error errorMessage={error.message} />
  if (loading) return <Loading />

  return (
    <>
      <Helmet>
        <title>{t("navigation;Draft Cup")} | sendou.ink</title>
      </Helmet>
      <PageHeader title={t("navigation;Draft Cup")} />
      <Box color={grayWithShade}>{t("draft;draftExplanation")}</Box>

      <DraftTournamentCards tournaments={data!.plusDraftCups.tournaments} />
      <Box mt="1em">
        <DraftLeaderboard leaderboards={data!.plusDraftCups.leaderboards} />
      </Box>
    </>
  )
}

export default DraftCupPage
