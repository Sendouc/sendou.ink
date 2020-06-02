const {
  UserInputError,
  AuthenticationError,
  gql,
} = require("apollo-server-express")
const Maplist = require("../mongoose-models/maplist")
const MapBallot = require("../mongoose-models/mapballot") //[PositiveVoteCount!]!
const maps = require("../utils/maps")

const typeDef = gql`
  extend type Query {
    maplists(name: String): [Maplist!]!
    plusMaplists: [Maplist!]!
    mapVotes: [MapVote!]
    positiveVotes(mode: Mode = SZ): Boolean
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
      const criteria = args.name ? { name: args.name } : {}
      return Maplist.find(criteria)
        .sort({ order: "asc" })
        .catch((e) => {
          throw new UserInputError(e.message, {
            invalidArgs: args,
          })
        })
    },
    plusMaplists: (root, args) => {
      return Maplist.find({ plus: { $ne: null } }).sort({
        "plus.year": "desc",
        "plus.month": "desc",
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
        return maps.map((map) => ({ name: map, sz: 0, tc: 0, rm: 0, cb: 0 }))
      }

      return mapBallot.maps
    },
    positiveVotes: async (root, args, ctx) => {
      const ballots = await MapBallot.find({})

      const count = {}
      ballots.forEach((ballot) => {
        ballot.maps.forEach((stage) => {
          let toIcrement = 0
          if (stage[args.mode.toLowerCase()] === 1) toIcrement = 1

          const votes = count[stage.name] ? count[stage.name] : 0
          count[stage.name] = votes + toIcrement
        })
      })

      return true
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
        (ballot) => !!ballot.discord_user.plus.membership_status
      )

      const voter_count = validBallots.length
      const vote_counts = maps.map((stage) => ({
        name: stage,
        sz: [0, 0, 0],
        tc: [0, 0, 0],
        rm: [0, 0, 0],
        cb: [0, 0, 0],
      }))

      validBallots.forEach((ballot) =>
        ballot.maps.forEach((stage, index) => {
          const { sz, tc, rm, cb } = stage
          // one is added to the index so -1 vote goes to 0 index, 0 to 1 and 1 to 2
          vote_counts[index].sz[sz + 1] = vote_counts[index].sz[sz + 1] + 1
          vote_counts[index].tc[tc + 1] = vote_counts[index].tc[tc + 1] + 1
          vote_counts[index].rm[rm + 1] = vote_counts[index].rm[rm + 1] + 1
          vote_counts[index].cb[cb + 1] = vote_counts[index].cb[cb + 1] + 1
        })
      )

      let allMaps = []
      vote_counts.forEach((count) => {
        ;["sz", "tc", "rm", "cb"].forEach((mode) => {
          allMaps.push({
            name: count.name,
            score: +(
              (count[mode][0] * -1 + count[mode][2]) /
              voter_count
            ).toFixed(2),
            mode,
          })
        })
      })

      allMaps = allMaps.sort((a, b) => b.score - a.score)

      szMapPool = []
      tcMapPool = []
      rmMapPool = []
      cbMapPool = []

      const pools = {
        sz: szMapPool,
        tc: tcMapPool,
        rm: rmMapPool,
        cb: cbMapPool,
      }

      const mapCount = {}

      // we switch monthly to add variance
      const now = new Date()
      const month = now.getMonth() + 1
      const monthModes = [
        null,
        "sz",
        "tc",
        "rm",
        "cb",
        "sz",
        "tc",
        "rm",
        "cb",
        "sz",
        "tc",
        "rm",
        "cb",
      ]
      let modeToAddTo = monthModes[month]
      const nextModeDict = {
        sz: "tc",
        tc: "rm",
        rm: "cb",
        cb: "sz",
      }

      while (
        szMapPool.length < 8 ||
        tcMapPool.length < 8 ||
        rmMapPool.length < 8 ||
        cbMapPool.length < 8
      ) {
        for (const stageObj of allMaps) {
          const pool = pools[modeToAddTo]

          if (pool.length === 8) {
            break
          }

          const alreadyInCount = mapCount[stageObj.name]
            ? mapCount[stageObj.name]
            : 0

          if (alreadyInCount === 2) {
            continue
          }

          if (stageObj.mode !== modeToAddTo) {
            continue
          }

          if (pool.indexOf(stageObj.name) !== -1) {
            continue
          }

          mapCount[stageObj.name] = alreadyInCount + 1
          pool.push(stageObj.name)
          break
        }

        modeToAddTo = nextModeDict[modeToAddTo]
      }

      szMapPool.sort((a, b) => maps.indexOf(a) - maps.indexOf(b))
      tcMapPool.sort((a, b) => maps.indexOf(a) - maps.indexOf(b))
      rmMapPool.sort((a, b) => maps.indexOf(a) - maps.indexOf(b))
      cbMapPool.sort((a, b) => maps.indexOf(a) - maps.indexOf(b))

      const maplist = {
        name: `Plus Server ${now.toLocaleString("default", {
          month: "long",
        })} ${now.getFullYear()}`,
        sz: szMapPool,
        tc: tcMapPool,
        rm: rmMapPool,
        cb: cbMapPool,
        order: 0,
        plus: {
          month,
          year: now.getFullYear(),
          voter_count,
          vote_counts,
        },
      }

      await Maplist.updateMany({ order: 0 }, { order: 1 })
      await Maplist.create(maplist)

      return true
    },
  },
}

module.exports = {
  Maplist: typeDef,
  maplistResolvers: resolvers,
}
