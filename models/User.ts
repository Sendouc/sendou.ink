import * as Objection from "objection"

class User extends Objection.Model {
  static get tableName() {
    return "users"
  }
}

module.exports = User
