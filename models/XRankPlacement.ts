import * as Objection from "objection";
import Weapon from "./Weapon";

class XRankPlacement extends Objection.Model {
  static tableName = "xRankPlacements";

  id!: number;
  playerId!: string;
  playerName!: string;
  ranking!: number;
  xPower!: number;
  mode!: string;
  month!: number;
  year!: number;
  weaponId!: number;

  static get relationMappings() {
    return {
      weapon: {
        relation: Objection.Model.BelongsToOneRelation,
        modelClass: Weapon,
        join: {
          from: "xRankPlacements.weaponId",
          to: "weapons.id",
        },
      },
    };
  }
}

export default XRankPlacement;
