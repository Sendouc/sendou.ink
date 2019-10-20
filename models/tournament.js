const mongoose = require("mongoose")

const tournamentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  jpn: { type: Boolean, default: false },
  google_sheet_url: { type: String },
  date: { type: Date, required: true },
  popular_weapons: {
    type: [String],
    validate: [popular_weapon_limit, "{PATH} must be 5"]
  },
  winning_team_name: { type: String, required: true },
  winning_team_players: {
    type: [String],
    required: true,
    validate: [player_limit, "{PATH} must be 4"]
  },
  winning_team_unique_ids: {
    type: [String],
    required: false,
    validate: [player_limit, "{PATH} must be 4"],
    default: [null, null, null, null]
  }
})

function popular_weapon_limit(val) {
  return val.length === 5
}

function player_limit(val) {
  return val.length === 4
}

module.exports = mongoose.model("Tournament", tournamentSchema)
