import * as Objection from "objection"
import {
  salmonRunRecordWildcards,
  salmonRunRecordCategories,
} from "../utils/enums"
import salmonRunStages from "../utils/srMaps"

class SalmonRunRecord extends Objection.Model {
  static get tableName() {
    return "salmonRunRecords"
  }

  static get jsonSchema() {
    return {
      type: "object",

      required: ["approved", "goldenEggCount", "category", "stageId", "links"],

      properties: {
        approved: { type: "boolean" },
        goldenEggCount: { type: "integer", minimum: 1, maximum: 350 },
        wildcards: { type: "string", enum: salmonRunRecordWildcards },
        category: { type: "string", enum: salmonRunRecordCategories },
        links: {
          type: "array",
          items: {
            type: "string",
          },
          minContains: 1,
          maxContains: 8,
        },
        stageId: {
          type: "integer",
          minimum: 1,
          maximum: salmonRunStages.length,
        },
        grizzcoWeaponId: { type: "integer", minimum: 140, maximum: 143 },
      },
    }
  }

  static get relationMappings() {
    const User = require("./User")
    const Weapon = require("./Weapon")
    const SalmonRunStage = require("./SalmonRunStage")

    return {
      grizzcoWeapon: {
        relation: Objection.Model.BelongsToOneRelation,
        modelClass: Weapon,
        join: {
          from: "salmonRunRecords.grizzcoWeaponId",
          to: "weapons.id",
        },
      },

      stage: {
        relation: Objection.Model.BelongsToOneRelation,
        modelClass: SalmonRunStage,
        join: {
          from: "salmonRunRecords.stageId",
          to: "salmonRunStages.id",
        },
      },

      users: {
        relation: Objection.Model.ManyToManyRelation,
        modelClass: User,
        join: {
          from: "salmonRunRecords.id",

          through: {
            from: "salmonRunRecordUserRosters.recordId",
            to: "salmonRunRecordUserRosters.userId",
          },

          to: "users.id",
        },
      },

      weapons: {
        relation: Objection.Model.ManyToManyRelation,
        modelClass: Weapon,
        join: {
          from: "salmonRunRecords.id",

          through: {
            from: "salmonRunRecordWeaponRotations.recordId",
            to: "salmonRunRecordWeaponRotations.weaponId",
          },

          to: "weapons.id",
        },
      },
    }
  }
}

module.exports = SalmonRunRecord
