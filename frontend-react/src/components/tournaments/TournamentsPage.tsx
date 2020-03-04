import React, { useState } from "react"
import { RouteComponentProps, Link } from "@reach/router"
import { Helmet } from "react-helmet-async"
import PageHeader from "../common/PageHeader"
import {
  useQueryParams,
  NumberParam,
  StringParam,
  ArrayParam,
} from "use-query-params"
import { useQuery } from "@apollo/react-hooks"
import { SEARCH_FOR_TOURNAMENTS } from "../../graphql/queries/searchForTournaments"
import Loading from "../common/Loading"
import Error from "../common/Error"
import TournamentCard from "./TournamentCard"
import { Box, Grid } from "@chakra-ui/core"

interface SearchForTournamentsData {
  searchForTournaments: {
    tournaments: {
      id: string
      name: string
      jpn: boolean
      google_sheet_url?: string
      bracket?: string
      date: string
      popular_weapons: string[]
      winning_team_name: string
      winning_team_players: string[]
    }[]
    pageCount: number
  }
}

interface SearchForTournamentsVars {
  tournament_name?: string
  region?: string
  player_name?: string
  unique_id?: string
  team_name?: string
  comp?: string[]
  page?: number
}

const TournamentsPage: React.FC<RouteComponentProps> = ({}) => {
  const [query, setQuery] = useQueryParams({
    page: NumberParam,
    tournament_name: StringParam,
    region: StringParam,
    team_name: StringParam,
    player_name: StringParam,
    comp: ArrayParam,
  })
  const [forms, setForms] = useState<SearchForTournamentsVars>({
    page: query.page,
    tournament_name: query.tournament_name,
    region: query.region,
    team_name: query.team_name,
    player_name: query.player_name,
    comp: query.comp,
  })

  const { data, error, loading } = useQuery<
    SearchForTournamentsData,
    SearchForTournamentsVars
  >(SEARCH_FOR_TOURNAMENTS, {
    variables: query,
  })

  if (error) return <Error errorMessage={error.message} />
  if (loading || !data) return <Loading />

  const { tournaments } = data.searchForTournaments
  return (
    <>
      <Helmet>
        <title>Tournaments | sendou.ink</title>
      </Helmet>
      <PageHeader title="Tournaments" />
      <Grid
        gridGap="0.5em"
        gridTemplateColumns="repeat(auto-fit, minmax(260px, 1fr))"
      >
        {tournaments.map(tournament => (
          <Box key={tournament.id} p="0.5em">
            <Link to={`/tournaments/${tournament.id}`}>
              <TournamentCard tournament={tournament} styledOnHover />
            </Link>
          </Box>
        ))}
      </Grid>
    </>
  )
}

export default TournamentsPage
