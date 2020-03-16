import { gql } from "apollo-boost"

export const topPlayersOfWeapon = gql`
  query topPlayers($weapon: String!) {
    topPlayers(weapon: $weapon) {
      modeCount
      placements {
        id
        name
        rank
        mode
        x_power
        unique_id
        month
        year
      }
    }
  }
`
