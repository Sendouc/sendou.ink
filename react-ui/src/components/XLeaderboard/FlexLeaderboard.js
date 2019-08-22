import React from 'react'
import { Table, Icon, Popup, Segment } from 'semantic-ui-react'
import { useQuery } from '@apollo/react-hooks'
import { useSelector } from "react-redux"
import { Loader } from 'semantic-ui-react'
import { Link } from 'react-router-dom'

import { topFlex } from '../../graphql/queries/topFlex'

const FlexLeaderboard = ({ setActiveItem }) => {
  const result = useQuery(topFlex)
  const localization = useSelector(state => state.localization)
  setActiveItem('topFlex')

  if (result.loading) {
    return <div style={{"paddingTop": "25px", "paddingBottom": "20000px"}} ><Loader active inline='centered' /></div>
  }
  if (result.error) {
    return <div style={{"color": "red"}}>{result.error.message}</div>
  }
  document.title = 'Flex Leaderboard - sendou.ink'
  const leaderboard = result.data['topFlex']

  return (
    <Segment>
      <div style={{"padding": "5px"}}>
        <Table basic='very'>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell></Table.HeaderCell>
              <Table.HeaderCell>{localization['Name']}</Table.HeaderCell>
              <Table.HeaderCell>
                {localization['Power']}
                  <Popup 
                    trigger={<Icon name='question circle'/>}
                    content="Flex Power is the amount of unique weapons the player has reached top 500 with. Different kits count as unique weapons but reskins (e.g. Tentatek & Octoshot) don't."
                    position='bottom center' 
                  />
              </Table.HeaderCell>
              <Table.HeaderCell>Total Power</Table.HeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {leaderboard.map((player, index) => 
              <Table.Row key={player.id}>
                <Table.Cell>{index + 1}</Table.Cell>
                <Table.Cell><Link to={`/xsearch/p/${player.unique_id}`} style={{"color": "black"}}><u>{player.alias ? player.alias : player.name}</u></Link>
                  {player.twitter ? 
                    <a href={`https://twitter.com/${player.twitter}`}><Icon style={{"paddingLeft": "5px"}} name="twitter"/></a>
                    : null}
                </Table.Cell>
                <Table.Cell>{player.weaponsCount}</Table.Cell>
                <Table.Cell>
                  {player.topTotalScore}
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table>
      </div>
    </Segment>
  )

}

export default FlexLeaderboard