import React from 'react'
import { useQuery } from 'react-apollo-hooks'
import { topPlayersOfWeapon } from '../graphql/queries/topPlayersOfWeapon'
import weaponDictReversed from '../utils/internal_english.json'
import { Loader } from 'semantic-ui-react'

const InfoWeapon = ({ wpn }) => { //todo - handle error (404?)
  const result = useQuery(topPlayersOfWeapon, {weapon: weaponDictReversed[wpn]})

  if (result.loading) {
    return <div style={{"paddingTop": "25px", "paddingBottom": "20000px"}} ><Loader active inline='centered' /></div>
  }
  document.title = `${weaponDictReversed[wpn]} Leaderboard - sendou.ink`
  const leaderboard = result.data['topPlayers']

  return (
    <div>

    </div>
  )
}

export default InfoWeapon