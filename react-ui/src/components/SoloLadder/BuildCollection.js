import React from 'react'
import { useQuery } from 'react-apollo-hooks'
import { Table, Loader, Image, Pagination, Header, Popup, Icon } from 'semantic-ui-react'
import { Link, Redirect } from 'react-router-dom'

import { searchForBuildsByWeapon } from '../../graphql/queries/searchForBuildsByWeapon'
import weaponDict from '../../utils/english_internal.json'

import top500 from '../img/misc/top500.png'
import BDU from '../img/abilityIcons/BDU.png'
import BRU from '../img/abilityIcons/BRU.png'
import CB from '../img/abilityIcons/CB.png'
import DR from '../img/abilityIcons/DR.png'
import H from '../img/abilityIcons/H.png'
import ISM from '../img/abilityIcons/ISM.png'
import ISS from '../img/abilityIcons/ISS.png'
import LDE from '../img/abilityIcons/LDE.png'
import MPU from '../img/abilityIcons/MPU.png'
import NS from '../img/abilityIcons/NS.png'
import OG from '../img/abilityIcons/OG.png'
import QR from '../img/abilityIcons/QR.png'
import QSJ from '../img/abilityIcons/QSJ.png'
import REC from '../img/abilityIcons/REC.png'
import RES from '../img/abilityIcons/RES.png'
import RP from '../img/abilityIcons/RP.png'
import RSU from '../img/abilityIcons/RSU.png'
import SCU from '../img/abilityIcons/SCU.png'
import SJ from '../img/abilityIcons/SJ.png'
import SPU from '../img/abilityIcons/SPU.png'
import SS from '../img/abilityIcons/SS.png'
import SSU from '../img/abilityIcons/SSU.png'
import T from '../img/abilityIcons/T.png'
import TI from '../img/abilityIcons/TI.png'
import OS from '../img/abilityIcons/OS.png'

const abilities = {
  "BDU": {image: BDU, fullName: "Bomb Defense Up DX"},
  "BRU": {image: BRU, fullName: "Sub Power Up"},
  "CB": {image: CB, fullName: "Comeback", mainOnly: true},
  "DR": {image: DR, fullName: "Drop Roller", mainOnly: true},
  "H": {image: H, fullName: "Haunt", mainOnly: true},
  "ISM": {image: ISM, fullName: "Ink Saver (Main)"},
  "ISS": {image: ISS, fullName: "Ink Saver (Sub)"},
  "LDE": {image: LDE, fullName: "Last-Ditch Effort", mainOnly: true},
  "MPU": {image: MPU, fullName: "Main Power Up"},
  "NS": {image: NS, fullName: "Ninja Squid", mainOnly: true},
  "OG": {image: OG, fullName: "Opening Gambit", mainOnly: true},
  "QR": {image: QR, fullName: "Quick Respawn"},
  "QSJ": {image: QSJ, fullName: "Quick Super Jump"},
  "REC": {image: REC, fullName: "Ink Recovery Up"},
  "RES": {image: RES, fullName: "Ink Resistance Up"},
  "RP": {image: RP, fullName: "Respawn Punisher", mainOnly: true},
  "RSU": {image: RSU, fullName: "Run Speed Up"},
  "SCU": {image: SCU, fullName: "Special Charge Up"},
  "SJ": {image: SJ, fullName: "Stealth Jump", mainOnly: true},
  "SPU": {image: SPU, fullName: "Special Power Up"},
  "SS": {image: SS, fullName: "Special Saver"},
  "SSU": {image: SSU, fullName: "Swim Speed Up"},
  "T": {image: T, fullName: "Tenacity", mainOnly: true},
  "TI": {image: TI, fullName: "Thermal Ink", mainOnly: true},
  "OS": {image: OS, fullName: "Object Shredder", mainOnly: true}
}

const BuildCollection = ({ weapon, page, setPage }) => {
  const { data, error, loading } = useQuery(searchForBuildsByWeapon, { variables: { weapon, page }})
  
  if (loading) {
    return <div style={{"paddingTop": "25px", "paddingBottom": "20000px"}} ><Loader active inline='centered' /></div>
  }

  if (error) {
    return <div style={{"color": "red"}}>{error.message}</div>
  }

  const builds = data.searchForBuildsByWeapon.builds

  if (!builds) return <Redirect to='/404' />

  if (builds.length === 0) return <div style={{'paddingTop': '10px'}}>No builds with this weapon yet. You can be the first to submit one!</div>

  return (
    <div>
      <div style={{'paddingTop': '10px'}}>
        <Header size='large'>
          <img 
            src={`https://raw.githubusercontent.com/Leanny/leanny.github.io/master/splat2/weapons/Wst_${weaponDict[weapon]}.png`} 
            alt={weapon} 
          /> {weapon} Builds
          </Header>
          <Header size='tiny'></Header>
      </div>
      <div>
      <Table celled padded>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Discord Tag</Table.HeaderCell>
            <Table.HeaderCell textAlign='center'>
              <Popup 
                trigger={<Icon name='question circle'/>}
                content='If the player who posted the build has placed Top 500 in X Rank with the weapon in question Top 500 crown is displayed in this column.'
                position='top center' 
              />
            </Table.HeaderCell>
            <Table.HeaderCell>Headgear</Table.HeaderCell>
            <Table.HeaderCell>Clothing</Table.HeaderCell>
            <Table.HeaderCell>Shoes</Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {builds.map(b => {
            return (
              <Table.Row key={b.id}>
                <Table.Cell>
                  <Link to={`/u/${b.discord_id}`}>{`${b.discord_user.username}#${b.discord_user.discriminator}`}</Link>
                </Table.Cell>
                <Table.Cell collapsing>
                  {b.top ? <Image src={top500} style={{ "maxWidth": "40px", "height": "auto" }} /> : null}
                </Table.Cell>
                <Table.Cell singleLine>
                  <Image src={abilities[b.headgear[0]].image} inline />
                  <Image src={abilities[b.headgear[1]].image} style={{ "maxWidth": "40px", "height": "auto" }} inline />
                  <Image src={abilities[b.headgear[2]].image} style={{ "maxWidth": "40px", "height": "auto" }} inline />
                  <Image src={abilities[b.headgear[3]].image} style={{ "maxWidth": "40px", "height": "auto" }} inline />
                </Table.Cell>
                <Table.Cell singleLine>
                  <Image src={abilities[b.clothing[0]].image} inline />
                  <Image src={abilities[b.clothing[1]].image} style={{ "maxWidth": "40px", "height": "auto" }} inline />
                  <Image src={abilities[b.clothing[2]].image} style={{ "maxWidth": "40px", "height": "auto" }} inline />
                  <Image src={abilities[b.clothing[3]].image} style={{ "maxWidth": "40px", "height": "auto" }} inline />
                </Table.Cell>
                <Table.Cell singleLine>
                  <Image src={abilities[b.shoes[0]].image} inline />
                  <Image src={abilities[b.shoes[1]].image} style={{ "maxWidth": "40px", "height": "auto" }} inline />
                  <Image src={abilities[b.shoes[2]].image} style={{ "maxWidth": "40px", "height": "auto" }} inline />
                  <Image src={abilities[b.shoes[3]].image} style={{ "maxWidth": "40px", "height": "auto" }} inline />
                </Table.Cell>
              </Table.Row>
            )
          })}
        </Table.Body>
      </Table>
      <div>
        {data.searchForBuildsByWeapon.pageCount > 1 ?
        <Pagination
              activePage={page}
              boundaryRange={0}
              onPageChange={(e, { activePage }) => {
                window.scrollTo(0, 0)
                setPage(activePage)}}
              ellipsisItem={null}
              firstItem={null}
              lastItem={null}
              siblingRange={1}
              totalPages={data.searchForBuildsByWeapon.pageCount}
            /> : null}
      </div>
    </div>
    </div>
  )
}

export default BuildCollection