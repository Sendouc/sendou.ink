require('dotenv').config()
const { ApolloServer, UserInputError, AuthenticationError, gql } = require('apollo-server-express')
const mongoose = require('mongoose')
const express = require('express')
const axios = require('axios')
const cors = require('cors')
const Placement = require('./models/placement')
const Player = require('./models/player')
const Maplist = require('./models/maplist')
const Link = require('./models/link')
//const User = require('./models/user')
const jwt = require('jsonwebtoken')
const path = require('path')

mongoose.set('useFindAndModify', false)
mongoose.set('useCreateIndex', true)

let rotationData = {timestamp: 0}

console.log('connecting to MongoDB')

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, dbName: "production" })
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connection to MongoDB:', error.message)
})

const typeDefs = gql`
  type User {
    id: ID!
    username: String!
    passwordHash: String!
  }

  type Player {
    id: ID!
    name: String!
    unique_id: String!
    alias: String
    twitter: String
    weapons: [String!]!
    weaponsCount: Int!
    topTotal: [Placement!]!
    topTotalScore: Float
    topShooter: [Placement]
    topShooterScore: Float
    topBlaster: [Placement]
    topBlasterScore: Float
    topRoller: [Placement]
    topRollerScore: Float
    topCharger: [Placement]
    topChargerScore: Float
    topSlosher: [Placement]
    topSlosherScore: Float
    topSplatling: [Placement]
    topSplatlingScore: Float
    topDualies: [Placement]
    topDualiesScore: Float
    topBrella: [Placement]
    topBrellaScore: Float
  }

  type Placement {
    id: ID!
    name: String!
    weapon: String!
    rank: Int!
    mode: Int!
    x_power: Float!
    unique_id: String!
    month: Int!
    year: Int!
  }

  type topPlayer {
    placements: [Placement!]!
    modeCount: [Int!]!
  }

  type PlayerWithPlacements {
    player: Player!
    placements: [Placement!]!
  }

  type Maplist {
    name: String!
    sz: [String!]!
    tc: [String!]!
    rm: [String!]!
    cb: [String!]!
  }

  enum LinkType {
    DISCORD
    GUIDE
    MISC
  }

  type Link {
    title: String!
    url: String!
    description: String!
    type: LinkType!
  }

  type Token {
    value: String!
  }

  type Query {
    playerCount: Int!
    topTotalPlayers (amount: Int): [Player!]!
    topShooterPlayers (amount: Int): [Player!]!
    topBlasterPlayers (amount: Int): [Player!]!
    topRollerPlayers (amount: Int): [Player!]!
    topChargerPlayers (amount: Int): [Player!]!
    topSlosherPlayers (amount: Int): [Player!]!
    topSplatlingPlayers (amount: Int): [Player!]!
    topDualiesPlayers (amount: Int): [Player!]!
    topBrellaPlayers (amount: Int): [Player!]!
    topPlayers (weapon: String!): topPlayer!
    topFlex: [Player!]!
    weaponPlacementStats(weapon: String!): [Int!]!
    playerInfo(uid: String!): PlayerWithPlacements!
    searchForPlayers(name: String! exact: Boolean): [Placement]!
    maplists: [Maplist!]!
    rotationData: String
    links: [Link!]!
  }

  type Mutation {
    createUser(
      username: String!
      favoriteGenre: String!
    ): User
    login(
      username: String!
      password: String!
    ): Token
  }    
`

const resolvers = {
  Query: {
    playerCount: () => Player.collection.countDocuments(),
    topTotalPlayers: (root, args) => {
      if (!args.amount) {
        args.amount = 50
      }

      if (args.amount < 1 || args.amount > 50) {
        throw new UserInputError('amount requested has to be between 1 and 50', {
          invalidArgs: args,
        })
      }
      
      return Player
        .find({ topTotalScore: { $ne: null} })
        .sort({ "topTotalScore": "desc" })
        .limit(args.amount)
        .populate("topTotal", {"unique_id": 0})
        .catch(e => {
          throw new UserInputError(e.message, {
            invalidArgs: args,
          })
        })
    },
    topShooterPlayers: (root, args) => {
      if (!args.amount) {
        args.amount = 50
      }

      if (args.amount < 1 || args.amount > 50) {
        throw new UserInputError('amount requested has to be between 1 and 50', {
          invalidArgs: args,
        })
      }

      return Player
        .find({ topShooterScore: { $ne: null} })
        .sort({ "topShooterScore": "desc" })
        .limit(args.amount)
        .populate("topShooter", {"unique_id": 0})
    },
    topBlasterPlayers: (root, args) => {
      if (!args.amount) {
        args.amount = 50
      }

      if (args.amount < 1 || args.amount > 50) {
        throw new UserInputError('amount requested has to be between 1 and 50', {
          invalidArgs: args,
        })
      }

      return Player
        .find({ topBlasterScore: { $ne: null} })
        .sort({ "topBlasterScore": "desc" })
        .limit(args.amount)
        .populate("topBlaster", {"unique_id": 0})
    },
    topRollerPlayers: (root, args) => {
      if (!args.amount) {
        args.amount = 50
      }

      if (args.amount < 1 || args.amount > 50) {
        throw new UserInputError('amount requested has to be between 1 and 50', {
          invalidArgs: args,
        })
      }

      return Player
        .find({ topRollerScore: { $ne: null} })
        .sort({ "topRollerScore": "desc" })
        .limit(args.amount)
        .populate("topRoller", {"unique_id": 0})
    },
    topChargerPlayers: (root, args) => {
      if (!args.amount) {
        args.amount = 50
      }

      if (args.amount < 1 || args.amount > 50) {
        throw new UserInputError('amount requested has to be between 1 and 50', {
          invalidArgs: args,
        })
      }

      return Player
        .find({ topChargerScore: { $ne: null} })
        .sort({ "topChargerScore": "desc" })
        .limit(args.amount)
        .populate("topCharger", {"unique_id": 0})
    },
    topSlosherPlayers: (root, args) => {
      if (!args.amount) {
        args.amount = 50
      }

      if (args.amount < 1 || args.amount > 50) {
        throw new UserInputError('amount requested has to be between 1 and 50', {
          invalidArgs: args,
        })
      }

      return Player
        .find({ topSlosherScore: { $ne: null} })
        .sort({ "topSlosherScore": "desc" })
        .limit(args.amount)
        .populate("topSlosher", {"unique_id": 0})
    },
    topSplatlingPlayers: (root, args) => {
      if (!args.amount) {
        args.amount = 50
      }

      if (args.amount < 1 || args.amount > 50) {
        throw new UserInputError('amount requested has to be between 1 and 50', {
          invalidArgs: args,
        })
      }

      return Player
        .find({ topSplatlingScore: { $ne: null} })
        .sort({ "topSplatlingScore": "desc" })
        .limit(args.amount)
        .populate("topSplatling", {"unique_id": 0})
    },
    topDualiesPlayers: (root, args) => {
      if (!args.amount) {
        args.amount = 50
      }

      if (args.amount < 1 || args.amount > 50) {
        throw new UserInputError('amount requested has to be between 1 and 50', {
          invalidArgs: args,
        })
      }

      return Player
        .find({ topDualiesScore: { $ne: null} })
        .sort({ "topDualiesScore": "desc" })
        .limit(args.amount)
        .populate("topDualies", {"unique_id": 0})
    },
    topBrellaPlayers: (root, args) => {
      if (!args.amount) {
        args.amount = 50
      }

      if (args.amount < 1 || args.amount > 50) {
        throw new UserInputError('amount requested has to be between 1 and 50', {
          invalidArgs: args,
        })
      }

      return Player
        .find({ topBrellaScore: { $ne: null} })
        .sort({ "topBrellaScore": "desc" })
        .limit(args.amount)
        .populate("topBrella", {"unique_id": 0})
    },
    topPlayers: async (root, args) => {
      const placements =  await Placement
        .find({ weapon: args.weapon })
        .sort({ "x_power": "desc" })
        .select({ weapon: 0})
        .catch(e => {
          throw new UserInputError(e.message, {
            invalidArgs: args,
          })
        })
      
      const m = placements.reduce((acc, cur) => {
        if (cur.mode === 1) {
          acc.sz++
        } else if (cur.mode === 2) {
          acc.tc++
        } else if (cur.mode === 3) {
          acc.rm++
        } else {
          acc.cb++
        }

        return acc
      }, {sz: 0, tc: 0, rm: 0, cb: 0})

      return {placements: placements.slice(0, 101), modeCount: [m.sz+m.tc+m.rm+m.cb, m.sz, m.tc, m.rm, m.cb]}
    },
    topFlex: async (root, args) => {
      return Player
        .find({})
        .sort({ "weaponsCount": "desc", "topTotalScore": "desc" })
        .limit(50)
    },
    playerInfo: async (root, args) => {
      const player = await Player
        .findOne({ unique_id: args.uid })
        .catch(e => {
          throw new UserInputError(e.message, {
            invalidArgs: args,
          })
        })

      if (!player) {
        throw new UserInputError('player not found with the id given', {
          invalidArgs: args,
        })
      }
      const placements = await Placement
        .find({ unique_id: args.uid })
        .sort({ "year": "asc", "month": "asc" })
        .catch(e => {
          throw new UserInputError(e.message, {
            invalidArgs: args,
          })
        })

      return { player, placements }
    },
    searchForPlayers: async (root, args) => {
      let placements = []
      if (args.exact) {
        placements = await Placement
          .find({ name: args.name })
          .sort({ "x_power": "desc" })
          .limit(100)
          .select({ name: 1, weapon: 1, x_power: 1, unique_id: 1})
          .catch(e => {
            throw new UserInputError(e.message, {
              invalidArgs: args,
            })
          })
      } else {
        placements = await Placement
          .find({ name: { "$regex": args.name, "$options": "i" }})
          .sort({ "x_power": "desc" })
          .limit(100)
          .select({ name: 1, weapon: 1, x_power: 1, unique_id: 1})
          .catch(e => {
            throw new UserInputError(e.message, {
              invalidArgs: args,
            })
          })
        }

      let uids = []

      return placements.filter(p => {
        if (uids.length === 21) {
          return false
        }
        const bool = uids.includes(p.unique_id)
        if (bool) {
          return false
        }
        uids.push(p.unique_id)
        return true
      })
    },
    maplists: (root, args) => {
      return Maplist
      .find({})
      .sort({ order: "asc" })
      .catch(e => {
        throw new UserInputError(e.message, {
          invalidArgs: args,
        })
      })
    },
    rotationData: async (root, args) => {
      if (Math.floor(Date.now() / 1000) - rotationData.timestamp > 7200) {  //only refetching data if two hours have passed
        const result = await axios.get('https://splatoon2.ink/data/schedules.json', { headers: { 'User-Agent': 'sendou.ink - owner: @Sendouc on Twitter'}})
        rotationData = result.data
        rotationData.timestamp = Math.floor(Date.now() / 1000)
        return JSON.stringify(rotationData)
      } else {
        return JSON.stringify(rotationData)
      }
    },
    links: (root, args) => {
      return Link
        .find({})
        .catch(e => {
          throw new UserInputError(e.message, {
            invalidArgs: args,
          })
        })
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null
    if (auth && auth.toLowerCase().startsWith('bearer ')) {
      const decodedToken = jwt.verify(
        auth.substring(7), process.env.JWT_SECRET
      )
      const currentUser = await User.findById(decodedToken.id)
      return { currentUser }
    }
  }
})

const app = express()
app.use(cors())
server.applyMiddleware({ app })

app.use(express.static('build'))

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'build', 'index.html'))
})

const PORT = process.env.PORT || 3001
app.listen({ port: PORT }, () => {
  console.log(`Server running on http://localhost:${PORT}${server.graphqlPath}`)
})