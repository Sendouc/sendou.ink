import * as Objection from "objection"

class Weapon extends Objection.Model {
  static get tableName() {
    return "weapons"
  }
}

module.exports = Weapon
