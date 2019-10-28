import React, { useState, useEffect } from "react"
import { searchForTournaments } from "../../graphql/queries/searchForTournaments"
import { useLazyQuery } from "@apollo/react-hooks"
import { useHistory, useLocation } from "react-router-dom"
import Loading from "../common/Loading"
import Error from "../common/Error"
import TournamentCard from "./TournamentCard"
import { Card, Button, Pagination } from "semantic-ui-react"

const TournamentSearchPage = () => {
  const history = useHistory()
  const location = useLocation()
  const [filter, setFilter] = useState({
    page: 1,
    tournament_name: null,
    jpn: null,
    team_name: null,
    player_name: null,
    comp: []
  })

  const [getTournaments, { data, error, loading }] = useLazyQuery(
    searchForTournaments,
    {
      variables: filter
    }
  )

  useEffect(() => {
    //find query params here and so something nice
    document.title = "Tournaments - sendou.ink"

    const searchParams = new URLSearchParams(location.search)
    const filterFromParams = {}
    for (const [key, value] of searchParams) {
      if (key === "page") {
        filterFromParams.page = parseInt(value)
      } else if (filter.hasOwnProperty(key)) {
        filterFromParams[key] = value
      }
    }

    setFilter({ ...filter, ...filterFromParams })
    getTournaments()
  }, [])

  const setPageAndUrl = pageNumber => {
    setFilter({ ...filter, page: pageNumber })
    const searchParams = new URLSearchParams(location.search)
    searchParams.set("page", pageNumber)
    searchParams.sort()
    history.push("/tournaments?" + searchParams.toString())
  }

  const setUrlAndGetData = () => {
    getTournaments()
    const searchParams = new URLSearchParams(location.search)
    for (const key in filter) {
      if (filter.hasOwnProperty(key) && filter[key] && filter[key].length > 0) {
        console.log("key", key)
        searchParams.set(key, filter[key])
      }
    }
    searchParams.sort()
    history.push("/tournaments?" + searchParams.toString())
  }

  /*Check why warning when ?page=500 */
  if (error) {
    if (error.message === "GraphQL error: too big page number given") {
      setFilter({ ...filter, page: 1 })
      setUrlAndGetData()
    }
    return <Error errorMessage={error.message} />
  }
  if (loading || !data) return <Loading />

  const pages = data.searchForTournaments.pageCount
  return (
    <>
      <div>
        <Button>Apply filters</Button>
      </div>

      {pages > 1 && (
        <div style={{ margin: "1em 0 1em 0" }}>
          <Pagination
            activePage={filter.page}
            onPageChange={(e, { activePage }) => setPageAndUrl(activePage)}
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
