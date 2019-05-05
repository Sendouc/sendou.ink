import React from 'react'
import { Table, Icon, Popup } from 'semantic-ui-react'
import { useQuery } from 'react-apollo-hooks'
import { Loader } from 'semantic-ui-react'

import FourWeapons from '../components/FourWeapons'

const WeaponLeaderboard = ({ query, queryName, scoreField, weaponsField, setActiveItem }) => {
  const result = useQuery(query)
  setActiveItem(weaponsField)

  if (result.loading) {
    return <div style={{"paddingTop": "25px", "paddingBottom": "20000px"}} ><Loader active inline='centered' /></div>
  }
  document.title = `${weaponsField.substring(3)} Leaderboard - sendou.ink`
  const leaderboard = result.data[queryName]

  return (
    <Table basic='very'>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell></Table.HeaderCell>
          <Table.HeaderCell>Name</Table.HeaderCell>
          <Table.HeaderCell>
            {weaponsField.substring(3)} Power 
              <Popup 
                trigger={<Icon name='question circle'/>}
                content='Power is the average of the top 4 best X powers. Hover over the weapon to receive information about that placement.'
                position='bottom center' 
              />
          </Table.HeaderCell>
          <Table.HeaderCell>Weapons</Table.HeaderCell>
        </Table.Row>
      </Table.Header>

      <Table.Body>
        {leaderboard.map((player, index) => 
          <Table.Row key={player.id}>
            <Table.Cell>{index + 1}</Table.Cell>
            <Table.Cell>{player.alias ? player.alias : player.name} 
              {player.twitter ? 
                <a href={`https://twitter.com/${player.twitter}`}><Icon name="twitter"/></a>
                : null}
            </Table.Cell>
            <Table.Cell>{player[scoreField]}</Table.Cell>
            <Table.Cell>
              <FourWeapons weapons={player[weaponsField]} />
            </Table.Cell>
          </Table.Row>
        )}
      </Table.Body>
    </Table>
  )

}

export default WeaponLeaderboard