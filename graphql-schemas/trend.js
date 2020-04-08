const { UserInputError, gql } = require("apollo-server-express")
const Trend = require("../mongoose-models/trend")
const weapons = require("../utils/weapons")

const typeDef = gql`
  extend type Query {
    xTrends: [Trend!]!
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
    xTrends: async (root, args) => {
      const trends = await Trend.find({})

      return trends.filter((trend) => weapons.includes(trend.weapon))
    },
  },
}

module.exports = {
  Trend: typeDef,
  trendResolvers: resolvers,
}
