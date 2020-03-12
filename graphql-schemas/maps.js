const { UserInputError, gql } = require("apollo-server-express")
const Maplist = require("../mongoose-models/maplist")
const MapBallot = require("../mongoose-models/mapballot")
const maps = require("../utils/maps")

const typeDef = gql`
  extend type Query {
    maplists: [Maplist!]!
    mapVotes: [MapVote!]
  }

  type Maplist {
    name: String!
    sz: [String!]!
    tc: [String!]!
    rm: [String!]!
    cb: [String!]!
  }

  type MapVote {
    name: String!
    sz: Int!
    tc: Int!
    rm: Int!
    cb: Int!
  }

  # type MapBallot {
  #   discord_id: String!
  #   maps: [MapVote!]!
  # }
`

const resolvers = {
  Query: {
    maplists: (root, args) => {
      return Maplist.find({})
        .sort({ order: "asc" })
        .catch(e => {
          throw new UserInputError(e.message, {
            invalidArgs: args,
          })
        })
    },
    mapVotes: async (root, args, ctx) => {
      if (!ctx.user || !ctx.user.plus || !ctx.user.plus.membership_status) {
        return null
      }

      const mapBallot = await MapBallot.findOne({
        discord_id: ctx.user.discord_id,
      })

      if (!mapBallot) {
        return maps.map(map => ({ name: map, sz: 0, tc: 0, rm: 0, cb: 0 }))
      }

      return mapBallot.maps
    },
  },
}

module.exports = {
  Maplist: typeDef,
  maplistResolvers: resolvers,
}
