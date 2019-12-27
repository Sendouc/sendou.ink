const { UserInputError, gql } = require("apollo-server-express")
const Trend = require("../mongoose-models/trend")

const typeDef = gql`
  extend type Query {
    searchForTrend(weapon: String!): Trend
  }
  type Year {
    year: Int!
    "Array that has length of 13. 0 index = null. Other indexes correspond months e.g. index 1 = January."
    SZ: [Int]!
    "Array that has length of 13. 0 index = null. Other indexes correspond months e.g. index 1 = January."
    TC: [Int]!
    "Array that has length of 13. 0 index = null. Other indexes correspond months e.g. index 1 = January."
    RM: [Int]!
    "Array that has length of 13. 0 index = null. Other indexes correspond months e.g. index 1 = January."
    CB: [Int]!
  }
  type Trend {
    weapon: String!
    counts: [Year!]!
  }
`

const resolvers = {
  Query: {
    searchForTrend: (root, args) => {
      return Trend.findOne({ weapon: args.weapon }).catch(e => {
        throw new UserInputError(e.message, {
          invalidArgs: args,
        })
      })
    },
  },
}

module.exports = {
  Trend: typeDef,
  trendResolvers: resolvers,
}
