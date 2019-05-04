require('dotenv').config()
const { ApolloServer, UserInputError, AuthenticationError, gql } = require('apollo-server')
const mongoose = require('mongoose')
const Placement = require('./models/placement')
const Player = require('./models/player')
//const User = require('./models/user')
const jwt = require('jsonwebtoken')

mongoose.set('useFindAndModify', false)
mongoose.set('useCreateIndex', true)

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
    unique_id: Int!
    alias: String
    twitter: String
    weapons: [String!]!
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
    unique_id: Int!
    month: Int!
    year: Int!
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

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})