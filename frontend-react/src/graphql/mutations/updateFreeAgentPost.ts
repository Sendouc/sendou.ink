import { DocumentNode, gql } from "@apollo/client"

export const UPDATE_FREE_AGENT_POST: DocumentNode = gql`
  mutation updateFreeAgentPost(
    $can_vc: CanVC!
    $playstyles: [Playstyle!]!
    $activity: String
    $looking_for: String
    $past_experience: String
    $description: String
  ) {
    updateFreeAgentPost(
      can_vc: $can_vc
      playstyles: $playstyles
      activity: $activity
      looking_for: $looking_for
      past_experience: $past_experience
      description: $description
    )
  }
`
