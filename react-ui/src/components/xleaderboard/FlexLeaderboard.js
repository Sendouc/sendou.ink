import React, { useEffect } from "react"
import { Table, Icon, Popup } from "semantic-ui-react"
import { useQuery } from "@apollo/react-hooks"
import { Link } from "react-router-dom"

import { topFlex } from "../../graphql/queries/topFlex"
import Error from "../common/Error"
import Loading from "../common/Loading"

const FlexLeaderboard = () => {
  useEffect(() => {
    document.title = "Flex Leaderboard - sendou.ink"
  }, [])
  const result = useQuery(topFlex)

  if (result.loading) {
    return (
      <div style={{ paddingTop: "2em" }}>
        <Loading />
      </div>
    )
  }
  if (result.error) {
    return <Error errorMessage={result.error.message} />
  }
  const leaderboard = result.data["topFlex"]

  return (
    <Table basic="very">
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell></Table.HeaderCell>
          <Table.HeaderCell>Name</Table.HeaderCell>
          <Table.HeaderCell>
            Power
            <Popup
              trigger={<Icon name="question circle" />}
              content="Flex Power is the amount of unique weapons the player has reached top 500 with. Different kits count as unique weapons but reskins (e.g. Tentatek & Octoshot) don't."
              position="bottom center"
            />
          </Table.HeaderCell>
          <Table.HeaderCell>Total Power</Table.HeaderCell>
        </Table.Row>
      </Table.Header>

      <Table.Body>
        {leaderboard.map((player, index) => (
          <Table.Row key={player.id}>
            <Table.Cell>{index + 1}</Table.Cell>
            <Table.Cell>
              <Link
                to={`/xsearch/p/${player.unique_id}`}
                style={{ color: "black" }}
              >
                <u>{player.alias ? player.alias : player.name}</u>
              </Link>
              {player.twitter ? (
                <a href={`https://twitter.com/${player.twitter}`}>
                  <Icon style={{ paddingLeft: "5px" }} name="twitter" />
                </a>
              ) : null}
            </Table.Cell>
            <Table.Cell>{player.weaponsCount}</Table.Cell>
            <Table.Cell>{player.topTotalScore}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  )
}

export default FlexLeaderboard
