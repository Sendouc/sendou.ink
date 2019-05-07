import React, { useState, useEffect } from 'react'
import { useQuery } from 'react-apollo-hooks'
import { topPlayersOfWeapon } from '../graphql/queries/topPlayersOfWeapon'
import weaponDictReversed from '../utils/internal_english.json'
import { Loader, Header, Table, Checkbox } from 'semantic-ui-react'
import { withRouter } from 'react-router-dom'

import szIcon from './modeIcons/sz.png'
import tcIcon from './modeIcons/tc.png'
import rmIcon from './modeIcons/rm.png'
import cbIcon from './modeIcons/cb.png'
import { months, modes } from '../utils/lists'

const modeIcons = ["", szIcon, tcIcon, rmIcon, cbIcon]

const InfoWeapon = withRouter(({ history, wpn }) => { //todo - handle error (404?) //new weapons not shown?
  const { data, error, loading } = useQuery(topPlayersOfWeapon, {variables: {weapon: weaponDictReversed[wpn] }})
  const [uniqueId, setUniqueId] = useState('')
  const [allPlayers, setAllPlayers] = useState(true)
  const [fullLeaderboard, setFullLeaderboard] = useState([])
  const [filteredLeaderboard, setFilteredLeaderboard] = useState([])
  const [modeCount, setModeCount] = useState([])

  useEffect(() => {
    document.title = `${weaponDictReversed[wpn]} Leaderboard - sendou.ink`
    if (loading) {
      return
    }
    if (data['topPlayers']) {
      setFullLeaderboard(data['topPlayers']['placements'])
      setFilteredLeaderboard(data['topPlayers']['placements'].reduce((acc, cur) => {
        if(acc.uids.includes(cur.unique_id)) { //if player is already in the array
          return acc
        }
        acc.uids.push(cur.unique_id) //add uid so that same player isn't counted twice
        acc.array.push(cur) //add new player to the array
        return acc
      }, {array: [], uids: []}).array)
      setModeCount(data['topPlayers']['modeCount'])
    }
  }, [data, loading, wpn])

  if (!(wpn in weaponDictReversed)) {
    history.push('/404')
  }

  if (loading) {
    return <div style={{"paddingTop": "25px", "paddingBottom": "20000px"}} ><Loader active inline='centered' /></div>
  }
  if (error) {
    return <div style={{"color": "red"}}>{error.message}</div>
  }

  let leaderboard = fullLeaderboard
  if (!allPlayers) {
    leaderboard = filteredLeaderboard
  }

  return (
    <div>
      <div style={{"paddingTop": "20px", "paddingBottom": "20px"}}>
        <Header size='large'>
        <img 
          src={`https://raw.githubusercontent.com/Leanny/leanny.github.io/master/splat2/weapons/Wst_${wpn}.png`} 
          alt={weaponDictReversed[wpn]} 
        /> {weaponDictReversed[wpn]} Leaderboard
        </Header>
        <Header size='tiny'>
        <b>Times in Top 500:</b>
        <img src={modeIcons[1]} style={{"paddingLeft": "10px"}} alt="Splat Zones logo" /> {modeCount[1]}
        <img src={modeIcons[2]} style={{"paddingLeft": "10px"}} alt="Tower Control logo" /> {modeCount[2]}
        <img src={modeIcons[3]} style={{"paddingLeft": "10px"}} alt="Rainmaker logo" /> {modeCount[3]}
        <img src={modeIcons[4]} style={{"paddingLeft": "10px"}} alt="Clam Blitz logo" /> {modeCount[4]}<br/>
        Total {modeCount[0]}
        </Header>
      </div>
      <div>
        <Checkbox
          radio
          label='All'
          name='checkboxRadioGroup'
          checked={allPlayers}
          onChange={() => setAllPlayers(!allPlayers)}
        />
        <Checkbox
          style={{"paddingLeft": "5px"}}
          radio
          label='Highest only'
          name='checkboxRadioGroup'
          checked={!allPlayers}
          onChange={() => setAllPlayers(!allPlayers)}
        />
        <Table selectable compact>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell></Table.HeaderCell>
              <Table.HeaderCell>Name</Table.HeaderCell>
              <Table.HeaderCell>X Power</Table.HeaderCell>
              <Table.HeaderCell>Month</Table.HeaderCell>
              <Table.HeaderCell>Year</Table.HeaderCell>
              <Table.HeaderCell>Rank</Table.HeaderCell>
              <Table.HeaderCell>Mode</Table.HeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
          {leaderboard.map((p, i) => 
            <Table.Row key={p.id} active={p.unique_id === uniqueId} onClick={() => setUniqueId(p.unique_id)}>
              <Table.Cell>{i + 1}</Table.Cell>
              <Table.Cell>{p.name}</Table.Cell>
              <Table.Cell>{p.x_power}</Table.Cell>
              <Table.Cell>{months[p.month]}</Table.Cell>
              <Table.Cell>{p.year}</Table.Cell>
              <Table.Cell>{p.rank}</Table.Cell>
              <Table.Cell>
                <img 
                  style={{"height": "25px", "width": "25px"}} 
                  src={modeIcons[p.mode]} 
                  alt={`Mode icon for ${modes[p.mode]}`} 
                />
              </Table.Cell>
            </Table.Row>
          )}
          </Table.Body>
        </Table>
      </div>
    </div>
  )
})

export default InfoWeapon