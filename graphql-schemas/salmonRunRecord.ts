const { gql } = require("apollo-server-express")
import {
  salmonRunRecordWildcards,
  salmonRunRecordCategories,
} from "../utils/enums"

const typeDef = gql`
  extend type Mutation {
    createSalmonRunRecord(input: CreateSalmonRunRecordInput!): Boolean!
  }

  input CreateSalmonRunRecordInput {
    goldenEggCount: Int!
    stage: String!
    wildcards: SalmonRunRecordWildcards
    category: SalmonRunRecordCategory!
    rosterUserIds: [Int!]
    grizzcoWeapon: String
    weaponRotation: [String!]
    links: [String!]
  }

  enum SalmonRunRecordWildcards {
    ${salmonRunRecordWildcards.map((wildcard) => wildcard + "\n")}
  }

  enum SalmonRunRecordCategory {
    ${salmonRunRecordCategories.map((category) => category + "\n")}
  }
`

const resolvers = {
  Mutation: {
    createSalmonRunRecord: async (root: any, args: any) => {
      console.log(args)
      return true
    },
  },
}

module.exports = {
  SalmonRunRecord: typeDef,
  salmonRunRecordResolvers: resolvers,
}
