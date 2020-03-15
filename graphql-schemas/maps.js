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
    generateMaplistFromVotes: Boolean
  }

  type MapVoteCount {
    name: String!
    sz: [Int!]!
    tc: [Int!]!
    rm: [Int!]!
    cb: [Int!]!
  }

  type PlusMaplistInfo {
    month: Int!
    year: Int!
    voter_count: Int!
    vote_counts: [MapVoteCount!]!
  }

  type Maplist {
    name: String!
    sz: [String!]!
    tc: [String!]!
    rm: [String!]!
    cb: [String!]!
    plus: PlusMaplistInfo
  }

  type MapVote {
    name: String!
    sz: Int!
    tc: Int!
    rm: Int!
    cb: Int!
  }
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
    generateMaplistFromVotes: async (root, args, ctx) => {
      if (!ctx.user) throw new AuthenticationError("Not logged in")
      if (ctx.user.discord_id !== process.env.ADMIN_ID)
        throw new AuthenticationError("Not admin")

      const ballots = await MapBallot.find({}).populate("discord_user")

      const validBallots = ballots.filter(
        ballot => !!ballot.discord_user.plus.membership_status
      )

      /*type MapVoteCount {
    name: String!
    sz: [Int!]!
    tc: [Int!]!
    rm: [Int!]!
    cb: [Int!]!
  }*/
      const voter_count = validBallots.length
      const vote_counts = maps.map(stage => ({
        name: stage,
        sz: [0, 0, 0],
        tc: [0, 0, 0],
        rm: [0, 0, 0],
        cb: [0, 0, 0],
      }))

      validBallots.forEach(ballot =>
        ballot.maps.forEach((stage, index) => {
          const { sz, tc, rm, cb } = stage
          // one is added to the index so -1 vote goes to 0 index, 0 to 1 and 1 to 2
          vote_counts[index].sz[sz + 1] = vote_counts[index].sz[sz + 1] + 1
          vote_counts[index].tc[tc + 1] = vote_counts[index].tc[tc + 1] + 1
          vote_counts[index].rm[rm + 1] = vote_counts[index].rm[rm + 1] + 1
          vote_counts[index].cb[cb + 1] = vote_counts[index].cb[cb + 1] + 1
        })
      )

      let szMaps = []
      let tcMaps = []
      let rmMaps = []
      let cbMaps = []
      vote_counts.forEach(count => {
        szMaps.push({
          name: count.name,
          score: +((count.sz[0] * -1 + count.sz[2]) / voter_count).toFixed(2),
        })
        tcMaps.push({
          name: count.name,
          score: +((count.tc[0] * -1 + count.tc[2]) / voter_count).toFixed(2),
        })
        rmMaps.push({
          name: count.name,
          score: +((count.rm[0] * -1 + count.rm[2]) / voter_count).toFixed(2),
        })
        cbMaps.push({
          name: count.name,
          score: +((count.cb[0] * -1 + count.cb[2]) / voter_count).toFixed(2),
        })
      })

      szMaps = szMaps.sort((a, b) => b.score - a.score)
      tcMaps = tcMaps.sort((a, b) => b.score - a.score)
      rmMaps = rmMaps.sort((a, b) => b.score - a.score)
      cbMaps = cbMaps.sort((a, b) => b.score - a.score)

      szMapPool = []
      tcMapPool = []
      rmMapPool = []
      cbMapPool = []

      for (const stageObj of szMaps) {
        if (szMapPool.length >= 8 && stageObj.score <= 0) {
          break
        }

        szMapPool.push(stageObj.name)
      }

      for (const stageObj of tcMaps) {
        if (tcMapPool.length >= 8 && stageObj.score <= 0) {
          break
        }

        tcMapPool.push(stageObj.name)
      }

      for (const stageObj of rmMaps) {
        if (rmMapPool.length >= 8 && stageObj.score <= 0) {
          break
        }

        rmMapPool.push(stageObj.name)
      }

      for (const stageObj of cbMaps) {
        console.log("cbMapPool.length", cbMapPool.length)
        if (cbMapPool.length >= 8 && stageObj.score <= 0) {
          break
        }

        cbMapPool.push(stageObj.name)
      }

      szMapPool.sort((a, b) => maps.indexOf(a) - maps.indexOf(b))
      tcMapPool.sort((a, b) => maps.indexOf(a) - maps.indexOf(b))
      rmMapPool.sort((a, b) => maps.indexOf(a) - maps.indexOf(b))
      cbMapPool.sort((a, b) => maps.indexOf(a) - maps.indexOf(b))

      console.log("szMapPool", szMapPool)
      console.log("tcMapPool", tcMapPool)
      console.log("rmMapPool", rmMapPool)
      console.log("cbMapPool", cbMapPool)

      /*type PlusMaplistInfo {
        month: Int!
        year: Int!
        voter_count: Int!
        vote_counts: [MapVoteCount!]!
      }
    
      type Maplist {
        name: String!
        sz: [String!]!
        tc: [String!]!
        rm: [String!]!
        cb: [String!]!
        plus: PlusMaplistInfo
      }*/

      const maplist = {
        name: `Plus Server getmonth getyear`,
        sz: szMapPool,
        tc: tcMapPool,
        rm: rmMapPool,
        cb: cbMapPool,
        plus: {
          month: 1,
          year: 1999,
          voter_count,
          vote_counts,
        },
      }

      console.log("maplist", maplist)
    },
  },
}

module.exports = {
  Maplist: typeDef,
  maplistResolvers: resolvers,
}
