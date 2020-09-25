import { useQuery } from "@apollo/client"
import { Alert, AlertIcon, Box, Grid } from "@chakra-ui/core"
import { Link, RouteComponentProps } from "@reach/router"
import { stringify } from "querystring"
import React, { useState } from "react"
import { Helmet } from "react-helmet-async"
import { useTranslation } from "react-i18next"
import {
  ArrayParam,
  encodeQueryParams,
  NumberParam,
  StringParam,
  useQueryParams,
} from "use-query-params"
import { SEARCH_FOR_TOURNAMENTS } from "../../graphql/queries/searchForTournaments"
import Error from "../common/Error"
import Loading from "../common/Loading"
import PageHeader from "../common/PageHeader"
import Pagination from "../common/Pagination"
import TournamentCard from "./TournamentCard"
import TournamentFilters from "./TournamentFilters"

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
  team_name?: string
  comp?: string[]
  page?: number
  mode?: string
  stage?: string
}

const queryMap = {
  page: NumberParam,
  tournament_name: StringParam,
  region: StringParam,
  team_name: StringParam,
  player_name: StringParam,
  comp: ArrayParam,
  mode: StringParam,
  stage: StringParam,
}

const TournamentsPage: React.FC<RouteComponentProps> = () => {
  const { t } = useTranslation()
  const [query, setQuery] = useQueryParams(queryMap)
  const [forms, setForms] = useState<SearchForTournamentsVars>({
    page: query.page,
    tournament_name: query.tournament_name,
    region: query.region,
    team_name: query.team_name,
    player_name: query.player_name,
    comp: query.comp,
    mode: query.mode,
    stage: query.stage,
  })

  const { data, error, loading } = useQuery<
    SearchForTournamentsData,
    SearchForTournamentsVars
  >(SEARCH_FOR_TOURNAMENTS, {
    variables: query,
  })

  if (error) return <Error errorMessage={error.message} />

  const handleFormChange = (value: Object) => {
    setForms({ ...forms, ...value })
  }

  const handleClear = () => {
    setForms({})
    setQuery({}, "replace")
  }

  const encodedQuery = encodeQueryParams(queryMap, query)
  const linkSuffix = `?${stringify(encodedQuery)}`

  return (
    <>
      <Helmet>
        <title>{t("navigation;Tournament Results")} | sendou.ink</title>
      </Helmet>
      <PageHeader title={t("navigation;Tournament Results")} />
      <TournamentFilters
        forms={forms}
        handleChange={handleFormChange}
        handleClear={handleClear}
        onSubmit={() => {
          const newObject = { ...forms, page: 1 }
          setForms(newObject)
          setQuery(newObject)
        }}
      />
      {data && data.searchForTournaments.tournaments.length > 0 ? (
        <>
          <Box mt="1em">
            <Pagination
              currentPage={forms.page ?? 1}
              pageCount={data?.searchForTournaments.pageCount ?? 999}
              onChange={(page) => {
                setForms({ ...forms, page })
                setQuery({ ...query, page })
              }}
            />
          </Box>
          {data && data.searchForTournaments ? (
            <>
              <Grid
                gridGap="1em"
                gridTemplateColumns="repeat(auto-fit, minmax(260px, 1fr))"
                mt="1em"
              >
                {data.searchForTournaments.tournaments.map((tournament) => (
                  <Box key={tournament.id}>
                    <Link to={`/tournaments/${tournament.id}${linkSuffix}`}>
                      <TournamentCard tournament={tournament} styledOnHover />
                    </Link>
                  </Box>
                ))}
              </Grid>
              <Box mt="1em">
                <Pagination
                  currentPage={forms.page ?? 1}
                  pageCount={data.searchForTournaments.pageCount}
                  onChange={(page) => {
                    setForms({ ...forms, page })
                    setQuery({ ...query, page })
                  }}
                />
              </Box>
            </>
          ) : (
            <Loading />
          )}
        </>
      ) : (
        !loading && (
          <Alert status="info" mt="2em">
            <AlertIcon />
            Your doesn't match any tournaments. Try another filter!
          </Alert>
        )
      )}
    </>
  )
}

export default TournamentsPage
