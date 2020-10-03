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

  static modifiers: Objection.Modifiers = {
    filterMode(query, mode) {
      if (!mode) return query;

      query.where("mode", "=", mode);
    },
    filterMonth(query, month) {
      if (!month) return query;

      query.where("month", "=", month);
    },
    filterYear(query, year) {
      if (!year) return query;

      query.where("year", "=", year);
    },
    filterName(query, name) {
      if (!name) return query;

      query.where(Objection.raw("player_name ILIKE ?", name));
    },
  };

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
