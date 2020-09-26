import * as Objection from "objection"
import {
  salmonRunRecordWildcards,
  salmonRunRecordCategories,
} from "../utils/enums"
import salmonRunStages from "../utils/srMaps"
import Weapon from "./Weapon"
import User from "./User"
import SalmonRunStage from "./SalmonRunStage"

function isValidURL(str: string) {
  var pattern = new RegExp(
    "^(https?:\\/\\/)?" +
      "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" +
      "((\\d{1,3}\\.){3}\\d{1,3}))" +
      "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" +
      "(\\?[;&a-z\\d%_.~+=-]*)?" +
      "(\\#[-a-z\\d_]*)?$",
    "i"
  )
  return !!pattern.test(str)
}

class SalmonRunRecord extends Objection.Model {
  static tableName = "salmonRunRecords"

  id!: number
  approved!: boolean
  goldenEggCount!: number
  wildcards!: string
  category!: string
  links!: string[]
  stageId!: number
  grizzcoWeaponId?: number
  weapons?: Weapon[]
  users!: User[]

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

  $beforeInsert() {
    const weaponsLen = this.weapons ? this.weapons.length : 0

    if (this.wildcards) {
      if (!this.wildcards.includes("GOLDEN") && !this.grizzcoWeaponId) {
        throw new Objection.ValidationError({
          type: "ModelValidation",
          message: "grizzco weapon needs to be defined with green wildcards",
        })
      }

      if (this.wildcards.includes("ONE") && weaponsLen !== 3) {
        throw new Objection.ValidationError({
          type: "ModelValidation",
          message: "three weapons needed with one wildcard",
        })
      }

      if (this.wildcards.includes("FOUR") && weaponsLen !== 0) {
        throw new Objection.ValidationError({
          type: "ModelValidation",
          message: "no weapons allowed with four wildcards",
        })
      }
    } else if (weaponsLen !== 4) {
      throw new Objection.ValidationError({
        type: "ModelValidation",
        message: "four weapons needed with no wildcards",
      })
    } else if (this.grizzcoWeaponId) {
      throw new Objection.ValidationError({
        type: "ModelValidation",
        message: "grizzco weapon not allowed without wildcards defined",
      })
    }

    for (const link of this.links) {
      if (!isValidURL(link)) {
        throw new Objection.ValidationError({
          type: "ModelValidation",
          message: "invalid link provided",
        })
      }
    }
  }

  static get relationMappings() {
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

export default SalmonRunRecord
