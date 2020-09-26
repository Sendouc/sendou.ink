import * as Objection from "objection"

class User extends Objection.Model {
  static tableName = "users"
}

export default User
