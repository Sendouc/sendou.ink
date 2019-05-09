import React from 'react'
import { Header, Image, Table } from 'semantic-ui-react'

import weaponDict from '../utils/english_internal.json'
import szIcon from './img/modeIcons/sz.png'
import tcIcon from './img/modeIcons/tc.png'
import rmIcon from './img/modeIcons/rm.png'
import cbIcon from './img/modeIcons/cb.png'
import { months } from '../utils/lists'

const TopPlacementTable = ({ top }) => {
  return (
    <Table basic='very' celled collapsing>
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
    {top.szX ?
      <Table.Body>
        <Table.Row>
          <Table.Cell>
            <Header as='h4' image>
              <Image src={szIcon} size='mini' />
              <Header.Content>
                Splat Zones
                <Header.Subheader>Highest X Power</Header.Subheader>
              </Header.Content>
            </Header>
          </Table.Cell>
          <Table.Cell>{top.szX.x_power}</Table.Cell>
          <Table.Cell>{top.szX.rank}</Table.Cell>
          <Table.Cell>
            <img 
              src={process.env.PUBLIC_URL + `/wpnSmall/Wst_${weaponDict[top.szX.weapon]}.png`}
              alt={top.szX.weapon}
            />
          </Table.Cell>
          <Table.Cell>{months[top.szX.month]}</Table.Cell>
          <Table.Cell>{top.szX.year}</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>
            <Header as='h4' image>
              <Image src={szIcon} size='mini' />
              <Header.Content>
                Splat Zones
                <Header.Subheader>Highest Placement</Header.Subheader>
              </Header.Content>
            </Header>
          </Table.Cell>
          <Table.Cell>{top.szTop.x_power}</Table.Cell>
          <Table.Cell>{top.szTop.rank}</Table.Cell>
          <Table.Cell>
            <img 
              src={process.env.PUBLIC_URL + `/wpnSmall/Wst_${weaponDict[top.szTop.weapon]}.png`}
              alt={top.szTop.weapon}
            />
          </Table.Cell>
          <Table.Cell>{months[top.szTop.month]}</Table.Cell>
          <Table.Cell>{top.szTop.year}</Table.Cell>
        </Table.Row>
      </Table.Body>
    : null
    }
    {top.tcX ?
      <Table.Body>
        <Table.Row>
          <Table.Cell>
            <Header as='h4' image>
              <Image src={tcIcon} size='mini' />
              <Header.Content>
                Tower Control
                <Header.Subheader>Highest X Power</Header.Subheader>
              </Header.Content>
            </Header>
          </Table.Cell>
          <Table.Cell>{top.tcX.x_power}</Table.Cell>
          <Table.Cell>{top.tcX.rank}</Table.Cell>
          <Table.Cell>
            <img 
              src={process.env.PUBLIC_URL + `/wpnSmall/Wst_${weaponDict[top.tcX.weapon]}.png`}
              alt={top.tcX.weapon}
            />
          </Table.Cell>
          <Table.Cell>{months[top.tcX.month]}</Table.Cell>
          <Table.Cell>{top.tcX.year}</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>
            <Header as='h4' image>
              <Image src={tcIcon} size='mini' />
              <Header.Content>
                Tower Control
                <Header.Subheader>Highest Placement</Header.Subheader>
              </Header.Content>
            </Header>
          </Table.Cell>
          <Table.Cell>{top.tcTop.x_power}</Table.Cell>
          <Table.Cell>{top.tcTop.rank}</Table.Cell>
          <Table.Cell>
            <img 
              src={process.env.PUBLIC_URL + `/wpnSmall/Wst_${weaponDict[top.tcTop.weapon]}.png`}
              alt={top.tcTop.weapon}
            />
          </Table.Cell>
          <Table.Cell>{months[top.tcTop.month]}</Table.Cell>
          <Table.Cell>{top.tcTop.year}</Table.Cell>
        </Table.Row>
      </Table.Body>
    : null
    }
    {top.rmX ?
      <Table.Body>
        <Table.Row>
          <Table.Cell>
            <Header as='h4' image>
              <Image src={rmIcon} size='mini' />
              <Header.Content>
                Rainmaker
                <Header.Subheader>Highest X Power</Header.Subheader>
              </Header.Content>
            </Header>
          </Table.Cell>
          <Table.Cell>{top.rmX.x_power}</Table.Cell>
          <Table.Cell>{top.rmX.rank}</Table.Cell>
          <Table.Cell>
            <img 
              src={process.env.PUBLIC_URL + `/wpnSmall/Wst_${weaponDict[top.rmX.weapon]}.png`}
              alt={top.rmX.weapon}
            />
          </Table.Cell>
          <Table.Cell>{months[top.rmX.month]}</Table.Cell>
          <Table.Cell>{top.rmX.year}</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>
            <Header as='h4' image>
              <Image src={rmIcon} size='mini' />
              <Header.Content>
                Rainmaker
                <Header.Subheader>Highest Placement</Header.Subheader>
              </Header.Content>
            </Header>
          </Table.Cell>
          <Table.Cell>{top.rmTop.x_power}</Table.Cell>
          <Table.Cell>{top.rmTop.rank}</Table.Cell>
          <Table.Cell>
            <img 
              src={process.env.PUBLIC_URL + `/wpnSmall/Wst_${weaponDict[top.rmTop.weapon]}.png`}
              alt={top.rmTop.weapon}
            />
          </Table.Cell>
          <Table.Cell>{months[top.rmTop.month]}</Table.Cell>
          <Table.Cell>{top.rmTop.year}</Table.Cell>
        </Table.Row>
      </Table.Body>
    : null
    }
    {top.cbX ?
      <Table.Body>
        <Table.Row>
          <Table.Cell>
            <Header as='h4' image>
              <Image src={cbIcon} size='mini' />
              <Header.Content>
                Clam Blitz
                <Header.Subheader>Highest X Power</Header.Subheader>
              </Header.Content>
            </Header>
          </Table.Cell>
          <Table.Cell>{top.cbX.x_power}</Table.Cell>
          <Table.Cell>{top.cbX.rank}</Table.Cell>
          <Table.Cell>
            <img 
              src={process.env.PUBLIC_URL + `/wpnSmall/Wst_${weaponDict[top.cbX.weapon]}.png`}
              alt={top.cbX.weapon}
            />
          </Table.Cell>
          <Table.Cell>{months[top.cbX.month]}</Table.Cell>
          <Table.Cell>{top.cbX.year}</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>
            <Header as='h4' image>
              <Image src={cbIcon} size='mini' />
              <Header.Content>
                Clam Blitz
                <Header.Subheader>Highest Placement</Header.Subheader>
              </Header.Content>
            </Header>
          </Table.Cell>
          <Table.Cell>{top.cbTop.x_power}</Table.Cell>
          <Table.Cell>{top.cbTop.rank}</Table.Cell>
          <Table.Cell>
            <img 
              src={process.env.PUBLIC_URL + `/wpnSmall/Wst_${weaponDict[top.cbTop.weapon]}.png`}
              alt={top.cbTop.weapon}
            />
          </Table.Cell>
          <Table.Cell>{months[top.cbTop.month]}</Table.Cell>
          <Table.Cell>{top.cbTop.year}</Table.Cell>
        </Table.Row>
      </Table.Body>
    : null
    }
  </Table>
  )
}

export default TopPlacementTable