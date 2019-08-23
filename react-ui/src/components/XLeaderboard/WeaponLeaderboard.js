import React from "react"
import { Table, Icon, Popup } from "semantic-ui-react"
import { useQuery } from "@apollo/react-hooks"
import { useSelector } from "react-redux"
import { Loader } from "semantic-ui-react"
import { Link } from "react-router-dom"

import FourWeapons from "./FourWeapons"

const WeaponLeaderboard = ({
  query,
  queryName,
  scoreField,
  weaponsField,
  setActiveItem
}) => {
  const result = useQuery(query)
  const localization = useSelector(state => state.localization)
  setActiveItem(weaponsField)

  if (result.loading) {
    return (
      <div style={{ paddingTop: "25px", paddingBottom: "20000px" }}>
        <Loader active inline="centered" />
      </div>
    )
  }
  if (result.error) {
    return <div style={{ color: "red" }}>{result.error.message}</div>
  }
  document.title = `${weaponsField.substring(3)} Leaderboard - sendou.ink`
  const leaderboard = result.data[queryName]

  return (
    <div style={{ margin: "1.5em" }}>
      <Table basic="very">
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell />
            <Table.HeaderCell>{localization["Name"]}</Table.HeaderCell>
            <Table.HeaderCell>
              {localization["Power"]}
              <Popup
                trigger={<Icon name="question circle" />}
                content={localization["Leaderboard explanation"]}
                position="bottom center"
              />
            </Table.HeaderCell>
            <Table.HeaderCell>{localization["Weapons"]}</Table.HeaderCell>
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
