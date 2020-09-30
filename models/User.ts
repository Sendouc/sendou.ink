import * as Objection from "objection";

class User extends Objection.Model {
  static tableName = "users";

  id!: number;
  username!: string;
  discriminator!: string;
  discordId!: string;
  discordAvatar!: string;
  playerId?: string;
}

export default User;
