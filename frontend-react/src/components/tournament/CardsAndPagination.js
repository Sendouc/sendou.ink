import React from "react"
import { Pagination, Icon, Card, Message } from "semantic-ui-react"
import { useHistory } from "react-router-dom"
import TournamentCard from "./TournamentCard"

const CardsAndPagination = ({ filter, fireQuery, data, comp }) => {
  const history = useHistory()
  if (data.searchForTournaments.tournaments.length === 0)
    return (
      <Message warning>
        No tournaments found. Try again with another search parameters.
      </Message>
    )

  const handleCardClick = id => {
    let toAppend = ""
    if (comp.length !== 0) {
      const searchParams = new URLSearchParams()
      searchParams.set("comp", comp)
      toAppend += "?" + searchParams.toString()
    }
    history.push(`/tournaments/${id}${toAppend}`)
  }

  return (
    <>
      <div style={{ margin: "1em 0 1em 0" }}>
        <Pagination
          activePage={filter.page}
          onPageChange={(e, { activePage }) => fireQuery({ page: activePage })}
          totalPages={data.searchForTournaments.pageCount}
          firstItem={null}
          lastItem={null}
          prevItem={{ content: <Icon name="angle left" />, icon: true }}
          nextItem={{ content: <Icon name="angle right" />, icon: true }}
        />
      </div>

      <Card.Group>
        {data.searchForTournaments.tournaments.map(tournament => (
          <TournamentCard
            key={tournament.name}
            tournament={tournament}
            centered
            showBracket={false}
            onClick={() => handleCardClick(tournament.id)}
          />
        ))}
      </Card.Group>

      <div style={{ margin: "1em 0 1em 0" }}>
        <Pagination
          activePage={filter.page}
          onPageChange={(e, { activePage }) => fireQuery({ page: activePage })}
          totalPages={data.searchForTournaments.pageCount}
          firstItem={null}
          lastItem={null}
          prevItem={{ content: <Icon name="angle left" />, icon: true }}
          nextItem={{ content: <Icon name="angle right" />, icon: true }}
        />
      </div>
    </>
  )
}

export default CardsAndPagination
