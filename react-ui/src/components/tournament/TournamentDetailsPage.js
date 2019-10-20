import React, { useEffect } from "react"
import Loading from "../common/Loading"
import Error from "../common/Error"
import { useQuery } from "@apollo/react-hooks"
import { Redirect, useParams } from "react-router-dom"
import { searchForTournamentById } from "../../graphql/queries/searchForTournamentById"
import TournamentCard from "./TournamentCard"
import { Divider, Header, Card, Image } from "semantic-ui-react"

import { modeIcons, mapIcons, wpnSmall } from "../../assets/imageImports"
import weaponDict from "../../utils/english_internal.json"
import AbilityIcon from "../common/AbilityIcon"
import NotFound from "../common/NotFound"

const rowColor = "#F4F4F4"

const abilityIcons = (round, index, winning = true) => {
  let arr_to_use = null
  if (winning) {
    arr_to_use = round.winning_team_main_abilities
  } else {
    arr_to_use = round.losing_team_main_abilities
  }

  if (arr_to_use.length === 0) return null

  return (
    <span style={{ paddingLeft: "0.5em" }}>
      <AbilityIcon ability={arr_to_use[index][0]} size="SUB" />
      <AbilityIcon
        ability={arr_to_use[index][1]}
        size="SUB"
        style={{ paddingLeft: "0.2em" }}
      />
      <AbilityIcon
        ability={arr_to_use[index][2]}
        size="SUB"
        style={{ paddingLeft: "0.2em" }}
      />
    </span>
  )
}

const TournamentDetailsPage = () => {
  const { id, weapons } = useParams()
  const { data, error, loading } = useQuery(searchForTournamentById, {
    variables: { id }
  })

  useEffect(() => {
    if (loading || !data.searchForTournamentById) return
    document.title = `${data.searchForTournamentById.name} - sendou.ink`
  }, [loading, data])

  if (loading) return <Loading />
  if (error) return <Error errorMessage={error.message} />
  if (!data.searchForTournamentById) return <NotFound />
  let weaponsToHighlight = []
  if (weapons) {
    weapons
      .split("&")
      .forEach(weapon => weaponsToHighlight.push(weapon.replace("_", " ")))
  }

  const resolveBackground = (rowIndex, weapons) => {
    const weaponsMatch = weaponsToHighlight.every(weapon => {
      return weapons.indexOf(weapon) !== -1
    })
    if (weaponsMatch && weaponsToHighlight.length > 0) return "#ffffb1"
    return rowIndex % 2 === 0 ? rowColor : "white"
  }

  return (
    <>
      <TournamentCard tournament={data["searchForTournamentById"]} centered />
      {data["searchForTournamentById"]["rounds"].map((round, rowIndex) => {
        return (
          <span key={`${round.round_name}_${round.game_number}`}>
            {round["game_number"] === 1 && (
              <Divider horizontal>
                <Header as="h4">{round.round_name}</Header>
              </Divider>
            )}
            <Card.Group centered>
              <Card
                style={{
                  background: resolveBackground(
                    rowIndex,
                    round.winning_team_weapons
                  )
                }}
              >
                <Card.Content>
                  <Card.Header>{round.winning_team_name}</Card.Header>
                  <Card.Meta>VICTORY</Card.Meta>
                  <table role="presentation">
                    <tbody>
                      {round.winning_team_players.map((player, index) => (
                        <tr key={player}>
                          <td>
                            <Image
                              src={
                                wpnSmall[
                                  weaponDict[round.winning_team_weapons[index]]
                                ]
                              }
                            />
                          </td>
                          <td>{player}</td>
                          <td>{abilityIcons(round, index, true)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card.Content>
              </Card>
              <Card
                style={{
                  width: "175px",
                  background: rowIndex % 2 === 0 ? rowColor : "white"
                }}
              >
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
              <Card
                style={{
                  background: resolveBackground(
                    rowIndex,
                    round.losing_team_weapons
                  )
                }}
              >
                <Card.Content>
                  <Card.Header>{round.losing_team_name}</Card.Header>
                  <Card.Meta>DEFEAT</Card.Meta>
                  <table role="presentation">
                    <tbody>
                      {round.losing_team_players.map((player, index) => (
                        <tr key={player}>
                          <td>
                            <Image
                              src={
                                wpnSmall[
                                  weaponDict[round.losing_team_weapons[index]]
                                ]
                              }
                            />
                          </td>
                          <td>{player}</td>
                          <td>{abilityIcons(round, index, false)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
