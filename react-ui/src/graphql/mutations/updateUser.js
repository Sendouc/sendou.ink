import { gql } from "apollo-boost"

export const updateUser = gql`
  mutation updateUser(
    $country: String
    $motion_sens: Float
    $stick_sens: Float
    $weapons: [String]
  ) {
    updateUser(
      country: $country
      motion_sens: $motion_sens
      stick_sens: $stick_sens
      weapons: $weapons
    )
  }
`
