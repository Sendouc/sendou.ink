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

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true })
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
    topTotalScore: Int
    topShooter: [Placement]
    topShooterScore: Int
    topBlaster: [Placement]
    topBlasterScore: Int
    topRoller: [Placement]
    topRollerScore: Int
    topCharger: [Placement]
    topChargerScore: Int
    topSlosher: [Placement]
    topSlosherScore: Int
    topSplatling: [Placement]
    topSplatlingScore: Int
    topDualies: [Placement]
    topDualiesScore: Int
    topBrella: [Placement]
    topBrellaScore: Int
  }
  type Placement {
    id: ID!
    name: String!
    weapon: String!
    rank: Int!
    mode: Int!
    x_power: Int!
    unique_id: Int!
    month: Int!
    year: Int!
  }
  type Token {
    value: String!
  }
  type Query {
    playerCount: Int!
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
    playerCount: () => Placement.collection.countDocuments()
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