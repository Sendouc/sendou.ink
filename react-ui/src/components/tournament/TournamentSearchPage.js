import React, { useEffect } from "react"
import { searchForTournaments } from "../../graphql/queries/searchForTournaments"
import Loading from "../common/Loading"
import { useHistory } from "react-router-dom"
import Error from "../common/Error"
import TournamentCard from "./TournamentCard"
import { Card, Pagination } from "semantic-ui-react"
import TournamentFilter from "./TournamentFilter"
import useUrlParamQuery from "../../hooks/useUrlParamQuery"

const TournamentSearchPage = () => {
  const history = useHistory()
  const {
    data,
    error,
    loading,
    filter,
    setFilter,
    fireQuery
  } = useUrlParamQuery(searchForTournaments, {
    page: 1,
    tournament_name: "",
    region: "all",
    team_name: "",
    player_name: "",
    comp: []
  })

  useEffect(() => {
    document.title = "Tournaments - sendou.ink"
  }, [])

  /*Check why warning when ?page=500 */
  if (error) {
    if (error.message === "GraphQL error: too big page number given") {
      fireQuery({ page: 1 })
    }
    return <Error errorMessage={error.message} />
  }
  if (loading || !data) return <Loading />

  const pages = data.searchForTournaments.pageCount
  return (
    <>
      <div style={{ marginBottom: "1em" }}>
        <TournamentFilter
          filter={filter}
          setFilter={setFilter}
          fireQuery={fireQuery}
        />
      </div>
      {pages > 1 && (
        <div style={{ margin: "1em 0 1em 0" }}>
          <Pagination
            activePage={filter.page}
            onPageChange={(e, { activePage }) =>
              fireQuery({ page: activePage })
            }
            totalPages={pages}
          />
        </div>
      )}

      <Card.Group>
        {data.searchForTournaments.tournaments.map(tournament => (
          <TournamentCard
            key={tournament.name}
            tournament={tournament}
            centered
            showBracket={false}
            onClick={() => history.push(`/tournaments/${tournament.id}`)}
          />
        ))}
      </Card.Group>
      {pages > 999 && (
        <div style={{ margin: "1em 0 1em 0" }}>
          <Pagination totalPages={pages} />
        </div>
      )}
    </>
  )
}

export default TournamentSearchPage
