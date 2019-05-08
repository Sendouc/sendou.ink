import React from 'react'
import { weaponsByCategory } from '../utils/lists'
import { categoryKeys } from '../utils/lists'
import weaponDict from '../utils/english_internal.json'
import { Table, Header, Popup } from 'semantic-ui-react'

const WpnPlayedTable = ({ weapons }) => {
  const weaponStyle = (wpnName) => {
    const activeStyle = {}
    const inactiveStyle = {"filter": "grayscale(1)", "opacity": "0.3"}

    return weapons.includes(wpnName) ? activeStyle : inactiveStyle
  }
  return (
    <Table basic='very' celled collapsing>

    {categoryKeys.map(c => {
      return (
      <Table.Body key={c}>
      <Table.Row>
        <Table.Cell>
          <Header as='h4'>
            <Header.Content>
              {c}
            </Header.Content>
          </Header>
        </Table.Cell>
        <Table.Cell>{weaponsByCategory[c].map(w => {
          return (
            <Popup
              key={w} 
              trigger={<img key={w} style={weaponStyle(w)} src={process.env.PUBLIC_URL + `/wpnSmall/Wst_${weaponDict[w]}.png`} alt={w} />}
              content={w}
            />
          )
        })}</Table.Cell>
      </Table.Row>
    </Table.Body>
    )})}

    <Table.Body>
      <Table.Row>
        <Table.Cell>
          <Header as='h4'>
            <Header.Content>
              Total
            </Header.Content>
          </Header>
        </Table.Cell>
        <Table.Cell>{weapons.length} / 129</Table.Cell>
      </Table.Row>
    </Table.Body>
  </Table>
  )
}

export default WpnPlayedTable