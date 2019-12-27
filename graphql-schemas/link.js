const { UserInputError, gql } = require("apollo-server-express")
const Link = require("../mongoose-models/link")

const typeDef = gql`
  extend type Query {
    links: [Link!]!
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
`
const resolvers = {
  Query: {
    links: (root, args) => {
      return Link.find({})
        .sort({ title: "asc" })
        .catch(e => {
          throw new UserInputError(e.message, {
            invalidArgs: args,
          })
        })
    },
  },
}

module.exports = {
  Link: typeDef,
  linkResolvers: resolvers,
}
