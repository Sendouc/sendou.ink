import * as Objection from "objection"

class SalmonRunStage extends Objection.Model {
  static get tableName() {
    return "salmonRunStage"
  }
}

module.exports = SalmonRunStage
