const { gql } = require("apollo-server-express")
const User = require("../mongoose-models/user")
const Build = require("../mongoose-models/build")
const FAPost = require("../mongoose-models/fapost")
const Tournament = require("../mongoose-models/tournament")

const typeDef = gql`
  extend type Query {
    stats: Stats
  }
  type Stats {
    build_count: Int!
    fa_count: Int!
    user_count: Int!
    tournament_count: Int!
  }
`
const resolvers = {
  Query: {
    stats: async () => {
      const user_count = await User.estimatedDocumentCount()
      const tournament_count = await Tournament.estimatedDocumentCount()
      const build_count = await Build.estimatedDocumentCount()
      const fa_count = await FAPost.countDocuments({ hidden: false })

      return { user_count, tournament_count, build_count, fa_count }
    },
  },
}

module.exports = {
  General: typeDef,
  generalResolvers: resolvers,
}
