import { useQuery } from "@apollo/client"
import { Box } from "@chakra-ui/core"
import { RouteComponentProps } from "@reach/router"
import React, { useContext } from "react"
import { Helmet } from "react-helmet-async"
import { useTranslation } from "react-i18next"
import {
  PlusDraftCupsData,
  PLUS_DRAFT_CUPS,
} from "../../graphql/queries/plusDraftCups"
import MyThemeContext from "../../themeContext"
import Error from "../common/Error"
import Loading from "../common/Loading"
import PageHeader from "../common/PageHeader"
import Section from "../common/Section"
import DraftLeaderboard from "./DraftLeaderboard"
import DraftTournamentCards from "./DraftTournamentCards"

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
      <Section mt="1em">
        <DraftLeaderboard leaderboards={data!.plusDraftCups.leaderboards} />
      </Section>
    </>
  )
}

export default DraftCupPage
