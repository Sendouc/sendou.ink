const {
  UserInputError,
  AuthenticationError,
  gql,
} = require("apollo-server-express")
const Maplist = require("../mongoose-models/maplist")
const MapBallot = require("../mongoose-models/mapballot")
const maps = require("../utils/maps")

const typeDef = gql`
  extend type Query {
    maplists: [Maplist!]!
    mapVotes: [MapVote!]
  }

  input MapVoteInput {
    name: String!
    sz: Int!
    tc: Int!
    rm: Int!
    cb: Int!
  }

  extend type Mutation {
    addMapVotes(votes: [MapVoteInput!]!): Boolean
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
  Mutation: {
    addMapVotes: async (root, args, ctx) => {
      if (!ctx.user || !ctx.user.plus || !ctx.user.plus.membership_status) {
        throw new AuthenticationError("Insufficient access")
      }

      const legitVotes = [-1, 0, 1]

      args.votes.forEach((vote, index) => {
        if (vote.name !== maps[index]) {
          throw new UserInputError(
            `Invalid map or position: ${vote.name} on the index ${index}`
          )
        }

        if (legitVotes.indexOf(vote.sz) === -1) {
          throw new UserInputError(`Invalid vote for sz: ${vote.sz}`)
        }

        if (legitVotes.indexOf(vote.tc) === -1) {
          throw new UserInputError(`Invalid vote for sz: ${vote.tc}`)
        }

        if (legitVotes.indexOf(vote.rm) === -1) {
          throw new UserInputError(`Invalid vote for sz: ${vote.rm}`)
        }

        if (legitVotes.indexOf(vote.cb) === -1) {
          throw new UserInputError(`Invalid vote for sz: ${vote.cb}`)
        }
      })

      const discord_id = ctx.user.discord_id
      await MapBallot.findOneAndUpdate(
        { discord_id },
        { discord_id, maps: args.votes },
        { upsert: true }
      )

      return true
    },
  },
}

module.exports = {
  Maplist: typeDef,
  maplistResolvers: resolvers,
}
