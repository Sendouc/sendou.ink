import React from 'react'
import { Table, Icon } from 'semantic-ui-react'
import { useQuery } from 'react-apollo-hooks'
import { Loader } from 'semantic-ui-react'

const WeaponLeaderboard = ({ query, queryName, scoreField }) => {
  const result = useQuery(query)

  if (result.loading) {
    return <Loader active inline='centered' />
  }
  const leaderboard = result.data[queryName]

  return (
    <Table basic='very'>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell></Table.HeaderCell>
          <Table.HeaderCell>Name</Table.HeaderCell>
          <Table.HeaderCell>Splatling Power ?</Table.HeaderCell>
          <Table.HeaderCell>Weapons</Table.HeaderCell>
        </Table.Row>
      </Table.Header>

      <Table.Body>
        {leaderboard.map((player, index) => 
          <Table.Row>
            <Table.Cell>{index + 1}</Table.Cell>
            <Table.Cell>{player.alias ? player.alias : player.name} 
            {player.twitter ? <Icon name="twitter"/> : null}</Table.Cell>
            <Table.Cell>{player[scoreField]}</Table.Cell>
            <Table.Cell>weapons</Table.Cell>
          </Table.Row>
        )}
      </Table.Body>
    </Table>
  )

}

export default WeaponLeaderboard