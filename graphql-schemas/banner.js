const { gql } = require("apollo-server-express")
const Banner = require("../mongoose-models/banner")

const typeDef = gql`
  extend type Query {
    banners: [Banner!]!
  }
  type Banner {
    id: ID!
    logoUrl: String!
    description: String!
    link: String!
    textColor: String!
    bgColor: String!
    staleAfter: String!
  }
`
const resolvers = {
  Query: {
    banners: () => {
      return Banner.find({ staleAfter: { $gte: new Date() } }).sort({
        date: "asc",
      })
    },
  },
}

module.exports = {
  Banner: typeDef,
  bannerResolvers: resolvers,
}
