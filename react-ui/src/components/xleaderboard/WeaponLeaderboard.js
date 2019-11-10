import React, { useEffect } from "react"
import { Table, Icon, Popup } from "semantic-ui-react"
import { useQuery } from "@apollo/react-hooks"
import { Link } from "react-router-dom"

import FourWeapons from "./FourWeapons"
import Loading from "../common/Loading"
import Error from "../common/Error"

const WeaponLeaderboard = ({ query, queryName, scoreField, weaponsField }) => {
  useEffect(() => {
    document.title = `${weaponsField.substring(3)} Leaderboard - sendou.ink`
  }, [weaponsField])

  const result = useQuery(query)

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

  const leaderboard = result.data[queryName]
  return (
    <div style={{ margin: "1.5em" }}>
      <Table basic="very">
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell />
            <Table.HeaderCell>Name</Table.HeaderCell>
            <Table.HeaderCell>
              Power
              <Popup
                trigger={<Icon name="question circle" />}
                content="Leaderboard explanation"
                position="bottom center"
              />
            </Table.HeaderCell>
            <Table.HeaderCell>Weapons</Table.HeaderCell>
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
              <Table.Cell>{player[scoreField]}</Table.Cell>
              <Table.Cell>
                <FourWeapons weapons={player[weaponsField]} />
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </div>
  )
}

export default WeaponLeaderboard
