import { gql, DocumentNode } from "apollo-boost"

export interface AddFreeAgentPostVars {
  can_vc: "YES" | "USUALLY" | "SOMETIMES" | "NO"
  playstyles: ("FRONTLINE" | "MIDLINE" | "BACKLINE")[]
  activity?: string
  looking_for?: string
  past_experience?: string
  description?: string
}

export const ADD_FREE_AGENT_POST: DocumentNode = gql`
  mutation addFreeAgentPost(
    $can_vc: CanVC!
    $playstyles: [Playstyle!]!
    $activity: String
    $looking_for: String
    $past_experience: String
    $description: String
  ) {
    addFreeAgentPost(
      can_vc: $can_vc
      playstyles: $playstyles
      activity: $activity
      looking_for: $looking_for
      past_experience: $past_experience
      description: $description
    )
  }
`
