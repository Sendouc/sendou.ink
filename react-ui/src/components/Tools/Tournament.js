import React, { useState } from 'react'
import { Segment, Header, Divider, Popup, Flag, Image, Button, Table } from 'semantic-ui-react'
import { Link } from 'react-router-dom'
import weaponDict from '../../utils/english_internal.json'
import szIcon from '../img/modeIcons/sz.png'
import tcIcon from '../img/modeIcons/tc.png'
import rmIcon from '../img/modeIcons/rm.png'
import cbIcon from '../img/modeIcons/cb.png'

const Tournament = ({ tournament }) => {
  const [expanded, setExpanded] = useState(false)
  const t = tournament
  let date = null
  let day = null
  let month = null
  let year = null
  let alphaCount = 0
  let bravoCount = 0

  const modeIcons = {
    "Splat Zones": szIcon,
    "Tower Control": tcIcon,
    "Rainmaker": rmIcon,
    "Clam Blitz": cbIcon
  }

  if (t.timestamp) {
    const monthNames = ["January", "February", "March", "April", "May", "June",
                        "July", "August", "September", "October", "November", "December"
                        ]
    date = new Date(t.timestamp * 1000)
    day = date.getDate()
    month = monthNames[date.getMonth()]
    year = date.getFullYear()
  }

  return (
    <div>
      <Segment raised compact padded>
        <Header>
          {t.name}
          {t.japanese ? <><br/>{<Flag name='jp'/>}</> : null}
          <Header.Subheader>{t.timestamp ? <>{`${day} ${month} ${year}`}</> : null}{t.patch ? <> | Patch {t.patch}</>: null}</Header.Subheader>
          <Header.Subheader>
            {t.bracket ? <a href={t.bracket}>Bracket</a> : null}
            {t.vod ? <> | <a href={t.vod}>VoD</a></> : null}<br />
          </Header.Subheader>
          <Header.Subheader>{t.team_count ? <>{t.team_count} teams</> : null}</Header.Subheader>
        </Header>
        <Divider />
        <b style={{'padding': '3px'}}>{t.alpha_team_name}</b><br/>
        {t.alpha_team_players.map((p, i) => {
          if (t.alpha_team[i]) return <span style={{"padding": "3px"}}><Link to={`/xsearch/p/${t.alpha_team[i]}`}>{p}</Link></span>
          return (
            <span style={{"padding": "3px"}}>{p}</span>
          )
        })}<br/>
        <span style={{'padding': '3px'}}>vs.</span><br/>
        <b style={{'padding': '3px'}}>{t.bravo_team_name}</b><br/>
        {t.bravo_team_players.map((p, i) => {
          if (t.bravo_team[i]) return <span style={{"padding": "3px"}}><Link to={`/xsearch/p/${t.bravo_team[i]}`}>{p}</Link></span>
          return (
            <span style={{"padding": "3px"}}>{p}</span>
          )
        })}
        <div style={{'paddingTop': '3px'}}>
          {t.weapons.map((w, i) => {
            return (
              <span key={w}>
                <Popup trigger={
                  <Image inline src={process.env.PUBLIC_URL + `/wpnSmall/Wst_${weaponDict[w]}.png`}></Image>
                }>
                  {w}
                </Popup>
                {i % 10 === 0 && i !== 0 ? <br/> : null}
              </span>
            )
          })}
        </div>
        <div style={{'paddingTop': '10px'}}>
        <Button onClick={() => setExpanded(!expanded)}>
          {expanded ? 'Hide battles' : 'Show battles'}
        </Button>
        </div>
        {expanded ?
          <div style={{"paddingTop": "10px"}}>
            <Table basic='very' celled collapsing>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Mode</Table.HeaderCell>
                <Table.HeaderCell>Map</Table.HeaderCell>
                <Table.HeaderCell>{t.alpha_team_name}<br/>{t.bravo_team_name}</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
              <Table.Body>
                {t.rounds.map(r => {
                  if (r.winner === 'ALPHA') alphaCount++
                  if (r.winner === 'BRAVO') bravoCount++
                  return (
                    <Table.Row>
                      <Table.Cell>
                        <Image size="mini" src={modeIcons[r.mode]} />
                      </Table.Cell>
                      <Table.Cell>
                        {r.map}
                      </Table.Cell>
                      <Table.Cell>
                        {r.alpha_weapons.map((w, i) => {
                            return (
                              <Popup trigger={
                                <Image
                                  style={{"maxWidth": "100px", "height": "auto", "width": "auto"}} 
                                  inline 
                                  src={process.env.PUBLIC_URL + `/wpnSmall/Wst_${weaponDict[w]}.png`} />}>
                                {t.alpha_team_players[i]}
                              </Popup>
                            )
                        })} {r.winner === 'ALPHA' ? '🏆' : null}<br/>
                        {r.bravo_weapons.map((w, i) => {
                            return (
                              <Popup trigger={
                                <Image
                                  style={{"maxWidth": "100px", "height": "auto", "width": "auto"}} 
                                  inline 
                                  src={process.env.PUBLIC_URL + `/wpnSmall/Wst_${weaponDict[w]}.png`} />}>
                                {t.bravo_team_players[i]}
                              </Popup>
                            )
                        })} {r.winner === 'BRAVO' ? '🏆' : null}
                      </Table.Cell>
                    </Table.Row>
                  )
                })}
                <Table.Row>
                  <Table.Cell></Table.Cell>
                  <Table.Cell>
                    {t.alpha_team_name} {alphaCount} - {bravoCount} {t.bravo_team_name}
                  </Table.Cell>
                </Table.Row>
              </Table.Body>
            </Table>
          </div>
        : null}
    </Segment>
    </div>
  )
}

export default Tournament