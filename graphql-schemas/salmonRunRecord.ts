const { gql } = require("apollo-server-express")
import SalmonRunRecord from "../models/SalmonRunRecord"
import Weapon from "../models/Weapon"
import SalmonRunStage from "../models/SalmonRunStage"
import {
  salmonRunRecordWildcards,
  salmonRunRecordCategories,
} from "../utils/enums"
import salmonRunStages from "../utils/srMaps"
import grizzcoWeapons from "../utils/grizzcoWeapons"
import weapons from "../utils/weapons"

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
    links: [String!]!
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
    createSalmonRunRecord: async (_: any, { input }: any) => {
      await SalmonRunRecord.transaction((trx) =>
        SalmonRunRecord.query(trx).insertGraph(
          {
            approved: false,
            goldenEggCount: input.goldenEggCount,
            wildcards: input.wildcards,
            category: input.category,
            links: input.links,
            stageId: salmonRunStages.indexOf(input.stage) + 1,
            grizzcoWeaponId: input.grizzcoWeapon
              ? grizzcoWeapons.indexOf(input.grizzcoWeapon) + 1 + 139
              : undefined,

            users: input.rosterUserIds
              ? input.rosterUserIds.map((id: number) => ({ id }))
              : undefined,

            weapons: input.weaponRotation
              ? input.weaponRotation.map((weapon: string) => ({
                  id: weapons.indexOf(weapon) + 1,
                }))
              : undefined,
          },
          { relate: true }
        )
      )
      return true
    },
  },
}

module.exports = {
  SalmonRunRecord: typeDef,
  salmonRunRecordResolvers: resolvers,
}
