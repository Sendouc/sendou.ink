import { DocumentNode, gql } from "@apollo/client";
import { User } from "../../types";

export interface SearchForUserData {
  searchForUser?: User;
}

export interface SearchForUserVars {
  discord_id?: string;
  custom_url?: string;
}

export const SEARCH_FOR_USER: DocumentNode = gql`
  query searchForUser($discord_id: String, $custom_url: String) {
    searchForUser(discord_id: $discord_id, custom_url: $custom_url) {
      id
      username
      discriminator
      discord_id
      twitch_name
      twitter_name
      youtube_name
      youtube_id
      country
      weapons
      top500
      custom_url
      bio
      avatar
      sens {
        stick
        motion
      }
    }
  }
`;
