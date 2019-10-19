import React from "react"
import Loading from "../common/Loading"
import Error from "../common/Error"
import { useQuery } from "@apollo/react-hooks"
import { Redirect, useParams } from "react-router-dom"
import { searchForTournamentById } from "../../graphql/queries/searchForTournamentById"
import TournamentCard from "./TournamentCard"
import { Divider, Header, Card, Image } from "semantic-ui-react"

import { modeIcons, mapIcons } from "../../assets/imageImports"

const TournamentDetailsPage = () => {
  const { id } = useParams()
  const { data, error, loading } = useQuery(searchForTournamentById, {
    variables: { id }
  })

  if (loading) return <Loading />
  if (error) return <Error errorMessage={error.message} />
  console.log("data", data)
  return (
    <>
      <TournamentCard tournament={data["searchForTournamentById"]} centered />
      {data["searchForTournamentById"]["rounds"].map(round => {
        return (
          <span key={`${round.round_name}_${round.game_number}`}>
            {round["game_number"] === 1 && (
              <Divider horizontal>
                <Header as="h4">{round.round_name}</Header>
              </Divider>
            )}
            <Card.Group centered>
              <Card style={{ width: "175px" }}>
                <Image src={mapIcons[round.stage]} />

                <Card.Content textAlign="center">
                  <Card.Header>{round.game_number}</Card.Header>
                  <Divider />
                  <Image
                    src={modeIcons[round.mode]}
                    alt={modeIcons[round.mode]}
                    size="mini"
                  />
                  <Card.Description>{round.stage}</Card.Description>
                </Card.Content>
              </Card>
            </Card.Group>
          </span>
        )
      })}
    </>
  )
}

export default TournamentDetailsPage
