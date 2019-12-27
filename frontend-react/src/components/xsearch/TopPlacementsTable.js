import React from "react"
import { Header, Image, Table } from "semantic-ui-react"

import { wpnSmall } from "../../assets/imageImports"
import weaponDict from "../../utils/english_internal.json"
import { months } from "../../utils/lists"
import szIcon from "../../assets/sz.png"
import tcIcon from "../../assets/tc.png"
import rmIcon from "../../assets/rm.png"
import cbIcon from "../../assets/cb.png"

const TopPlacementsTable = ({ top }) => {
  const returnRow = (x, placement, mode) => {
    if (!x) {
      return null
    }

    const modeIcon = ["", szIcon, tcIcon, rmIcon, cbIcon][mode]
    const modeName = [
      "",
      "Splat Zones",
      "Tower Control",
      "Rainmaker",
      "Clam Blitz"
    ][mode]

    if (x === placement) {
      return (
        <Table.Body>
          <Table.Row>
            <Table.Cell>
              <Header as="h4" image>
                <Image src={modeIcon} size="mini" />
                <Header.Content>
                  {modeName}
                  <Header.Subheader>
                    Highest X Power & Placement
                  </Header.Subheader>
                </Header.Content>
              </Header>
            </Table.Cell>
            <Table.Cell>{x.x_power}</Table.Cell>
            <Table.Cell>{x.rank}</Table.Cell>
            <Table.Cell>
              <img src={wpnSmall[weaponDict[x.weapon]]} alt={x.weapon} />
            </Table.Cell>
            <Table.Cell>{months[x.month]}</Table.Cell>
            <Table.Cell>{x.year}</Table.Cell>
          </Table.Row>
        </Table.Body>
      )
    }

    return (
      <Table.Body>
        <Table.Row>
          <Table.Cell>
            <Header as="h4" image>
              <Image src={modeIcon} size="mini" />
              <Header.Content>
                {modeName}
                <Header.Subheader>Highest X Power</Header.Subheader>
              </Header.Content>
            </Header>
          </Table.Cell>
          <Table.Cell>{x.x_power}</Table.Cell>
          <Table.Cell>{x.rank}</Table.Cell>
          <Table.Cell>
            <img src={wpnSmall[weaponDict[x.weapon]]} alt={x.weapon} />
          </Table.Cell>
          <Table.Cell>{months[x.month]}</Table.Cell>
          <Table.Cell>{x.year}</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>
            <Header as="h4" image>
              <Image src={modeIcon} size="mini" />
              <Header.Content>
                {modeName}
                <Header.Subheader>Highest Placement</Header.Subheader>
              </Header.Content>
            </Header>
          </Table.Cell>
          <Table.Cell>{placement.x_power}</Table.Cell>
          <Table.Cell>{placement.rank}</Table.Cell>
          <Table.Cell>
            <img
              src={wpnSmall[weaponDict[placement.weapon]]}
              alt={placement.weapon}
            />
          </Table.Cell>
          <Table.Cell>{months[placement.month]}</Table.Cell>
          <Table.Cell>{placement.year}</Table.Cell>
        </Table.Row>
      </Table.Body>
    )
  }
  return (
    <Table basic="very" celled collapsing>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell></Table.HeaderCell>
          <Table.HeaderCell>X Power</Table.HeaderCell>
          <Table.HeaderCell>Placement</Table.HeaderCell>
          <Table.HeaderCell>Weapon</Table.HeaderCell>
          <Table.HeaderCell>Month</Table.HeaderCell>
          <Table.HeaderCell>Year</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      {returnRow(top.szX, top.szTop, 1)}
      {returnRow(top.tcX, top.tcTop, 2)}
      {returnRow(top.rmX, top.rmTop, 3)}
      {returnRow(top.cbX, top.cbTop, 4)}
    </Table>
  )
}

export default TopPlacementsTable
