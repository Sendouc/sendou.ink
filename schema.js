//https://blog.apollographql.com/modularizing-your-graphql-schema-code-d7f71d5ed5f2

const { merge } = require("lodash")
const { makeExecutableSchema, gql } = require("apollo-server-express")
const { Build, buildResolvers } = require("./graphql-schemas/build")
const { Maplist, maplistResolvers } = require("./graphql-schemas/maps")
const { Placement, placementResolvers } = require("./graphql-schemas/placement")
const { Player, playerResolvers } = require("./graphql-schemas/player")
const { Rotation, rotationResolvers } = require("./graphql-schemas/rotation")
const { User, userResolvers } = require("./graphql-schemas/user")
const { Link, linkResolvers } = require("./graphql-schemas/link")
const { Trend, trendResolvers } = require("./graphql-schemas/trend")
const {
  Tournament,
  tournamentResolvers,
} = require("./graphql-schemas/tournament")
const {
  DetailedTournament,
  detailedTournamentResolvers,
} = require("./graphql-schemas/detailedtournament")
const {
  CompetitiveFeedEvent,
  competitiveFeedEventResolvers,
} = require("./graphql-schemas/competitivefeedevent")
const { FAPost, faPostResolvers } = require("./graphql-schemas/fapost")
const { Plus, plusResolvers } = require("./graphql-schemas/plus")
const { Team, teamResolvers } = require("./graphql-schemas/team")
const { General, generalResolvers } = require("./graphql-schemas/general")
const { Banner, bannerResolvers } = require("./graphql-schemas/banner")
const {
  SalmonRunRecord,
  salmonRunRecordResolvers,
} = require("./graphql-schemas/salmonRunRecord")

const Query = gql`
  type Query {
    _empty: String
  }
`

const Mutation = gql`
  type Mutation {
    _empty: String
  }
`

const resolvers = {}

const schema = makeExecutableSchema({
  typeDefs: [
    Query,
    Mutation,
    Build,
    Maplist,
    Placement,
    Player,
    Rotation,
    User,
    Link,
    Trend,
    Tournament,
    DetailedTournament,
    CompetitiveFeedEvent,
    FAPost,
    Plus,
    Team,
    General,
    Banner,
    SalmonRunRecord,
  ],
  resolvers: merge(
    resolvers,
    buildResolvers,
    maplistResolvers,
    placementResolvers,
    playerResolvers,
    rotationResolvers,
    userResolvers,
    linkResolvers,
    trendResolvers,
    tournamentResolvers,
    detailedTournamentResolvers,
    competitiveFeedEventResolvers,
    faPostResolvers,
    plusResolvers,
    teamResolvers,
    generalResolvers,
    bannerResolvers,
    salmonRunRecordResolvers
  ),
})

module.exports = schema
