//https://blog.apollographql.com/modularizing-your-graphql-schema-code-d7f71d5ed5f2

const { merge } = require("lodash")
const { makeExecutableSchema, gql } = require("apollo-server-express")
const { Build, buildResolvers } = require("./schemas/build")
const { Maplist, maplistResolvers } = require("./schemas/maplist")
const { Placement, placementResolvers } = require("./schemas/placement")
const { Player, playerResolvers } = require("./schemas/player")
const { Rotation, rotationResolvers } = require("./schemas/rotation")
const { User, userResolvers } = require("./schemas/user")
const { Link, linkResolvers } = require("./schemas/link")
const { Trend, trendResolvers } = require("./schemas/trend")
const { Tournament, tournamentResolvers } = require("./schemas/tournament")
const { FAPost, faPostResolvers } = require("./schemas/fapost")

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
    FAPost,
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
    faPostResolvers
  ),
})

module.exports = schema
