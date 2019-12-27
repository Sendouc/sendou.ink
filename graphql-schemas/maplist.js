const { UserInputError, gql } = require("apollo-server-express")
const Maplist = require("../mongoose-models/maplist")

const typeDef = gql`
  extend type Query {
    maplists: [Maplist!]!
  }
  type Maplist {
    name: String!
    sz: [String!]!
    tc: [String!]!
    rm: [String!]!
    cb: [String!]!
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
  },
}

module.exports = {
  Maplist: typeDef,
  maplistResolvers: resolvers,
}
