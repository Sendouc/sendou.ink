import React, { useEffect } from "react"
import { searchForTournaments } from "../../graphql/queries/searchForTournaments"
import Loading from "../common/Loading"
import Error from "../common/Error"
import TournamentFilter from "./TournamentFilter"
import useUrlParamQuery from "../../hooks/useUrlParamQuery"
import CardsAndPagination from "./CardsAndPagination"

const TournamentSearchPage = () => {
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

  //TODO: Handle too big page error more gracefully
  if (error) return <Error errorMessage={error.message} />

  return (
    <>
      <div style={{ marginBottom: "1.5em" }}>
        <TournamentFilter
          filter={filter}
          setFilter={setFilter}
          fireQuery={fireQuery}
        />
      </div>
      {loading || !data ? (
        <Loading />
      ) : (
        <CardsAndPagination
          filter={filter}
          fireQuery={fireQuery}
          data={data}
          comp={filter.comp}
        />
      )}
    </>
  )
}

export default TournamentSearchPage
