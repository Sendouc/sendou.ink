const { UserInputError, gql } = require('apollo-server-express')
const Video = require('../models/video')

const typeDef = gql`
  extend type Query {
    youtubeInfoById(youtube_id: String!): YouTubeInfo
    
  }
  enum MatchType {
    RANK
    XRANK
    TURF
    TOURNAMENT
    SCRIM
    SPEC
  }
  enum Status {
    PENDING
    REJECTED
    APPROVED
  }
  "Represents single match (one video can have multiple)-"
  type Video {
    "ID of the video on YouTube"
    youtube_id: String!
    video_title: String!
    "Timestamp in second of the match in the video"
    match_begin_timestamp: Int!
    "Timestamp when the match was uploaded to YouTube"
    upload_timestamp: Int!
    map: String!
    mode: String!
    weapon: String
    "Every unique weapon in the match if match type is SPEC."
    spec_weapons: [String!]
    "Only if the player in the video has reached Top 500."
    unique_id: String
    status: Status!
    "User ID of the user who submitted the video."
    submitter_id: String!
    match_type: MatchType!
    "True if the player in the match has reached Top 500 with the weapon in the match."
    top500: Boolean
    "Only if match_type is TOURNAMENT or SPEC"
    alpha_team_name: String
    "Only if match_type is TOURNAMENT or SPEC"
    bravo_team_name: String
    "Only if match_type is TOURNAMENT or SPEC"
    tournament_name: String
  }
  type YouTubeInfo {

  }
`
const resolvers = {
  Query: {
    youtubeInfoById: (root, args) => {
      const youtube_id = args.youtube_id
    }
  }
}

module.exports = {
  Video: typeDef,
  videoResolvers: resolvers
}