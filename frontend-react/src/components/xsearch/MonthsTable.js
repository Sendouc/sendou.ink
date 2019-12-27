import React from "react"
import { Table, Header, Image } from "semantic-ui-react"

import { wpnSmall } from "../../assets/imageImports"
import szIcon from "../../assets/sz.png"
import tcIcon from "../../assets/tc.png"
import rmIcon from "../../assets/rm.png"
import cbIcon from "../../assets/cb.png"
import { months } from "../../utils/lists"
import weaponDict from "../../utils/english_internal.json"

const MonthsTable = ({ placements }) => {
  //data received is ordered chronologically and sz->tc->rm->cb
  const modeIcons = [null, szIcon, tcIcon, rmIcon, cbIcon]
  let lastMonth = placements[0].month
  let toggle = false

  return (
    <Table basic="very" celled collapsing>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell></Table.HeaderCell>
          <Table.HeaderCell>Name</Table.HeaderCell>
          <Table.HeaderCell>X Power</Table.HeaderCell>
          <Table.HeaderCell>Placement</Table.HeaderCell>
          <Table.HeaderCell>Weapon</Table.HeaderCell>
        </Table.Row>
      </Table.Header>

      <Table.Body>
        {placements.map(p => {
          if (lastMonth !== p.month) {
            lastMonth = p.month
            toggle = !toggle
          }
          return (
            <Table.Row key={p.id} active={toggle}>
              <Table.Cell>
                <Header as="h4" image>
                  <Image src={modeIcons[p.mode]} rounded size="mini" />
                  <Header.Content>
                    {months[p.month]}
                    <Header.Subheader>{p.year}</Header.Subheader>
                  </Header.Content>
                </Header>
              </Table.Cell>
              <Table.Cell>{p.name}</Table.Cell>
              <Table.Cell>{p.x_power}</Table.Cell>
              <Table.Cell>{p.rank}</Table.Cell>
              <Table.Cell>
                <img src={wpnSmall[weaponDict[p.weapon]]} alt={p.weapon} />
              </Table.Cell>
            </Table.Row>
          )
        })}
      </Table.Body>
    </Table>
  )
}

export default MonthsTable
