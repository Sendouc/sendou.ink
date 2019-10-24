const mongoose = require("mongoose")

const roundSchema = new mongoose.Schema({
  tournament_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tournament",
    required: true
  },
  stage: { type: String, required: true },
  mode: { type: String, required: true },
  game_number: { type: Number, required: true },
  round_number: { type: Number, required: true },
  round_name: { type: String, required: true },
  winning_team_name: { type: String, required: true },
  winning_team_players: {
    type: [String],
    required: true,
    validate: [player_limit, "{PATH} must be 4"]
  },
  winning_team_weapons: {
    type: [String],
    required: true,
    validate: [player_limit, "{PATH} must be 4"]
  },
  winning_team_unique_ids: {
    type: [String],
    required: false,
    validate: [player_limit, "{PATH} must be 4"],
    default: [null, null, null, null]
  },
  winning_team_main_abilities: {
    type: [[String]],
    required: false,
    validate: [player_limit, "{PATH} must be 4"],
    default: [
      [null, null, null],
      [null, null, null],
      [null, null, null],
      [null, null, null]
    ]
  },
  winning_team_sub_abilities: {
    type: [[String]],
    required: false,
    validate: [player_limit, "{PATH} must be 4"],
    default: [
      [null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null]
    ]
  },
  losing_team_name: { type: String, required: true },
  losing_team_players: {
    type: [String],
    required: true,
    validate: [player_limit, "{PATH} must be 4"]
  },
  losing_team_weapons: {
    type: [String],
    required: true,
    validate: [player_limit, "{PATH} must be 4"]
  },
  losing_team_unique_ids: {
    type: [String],
    required: false,
    validate: [player_limit, "{PATH} must be 4"],
    default: [null, null, null, null]
  },
  losing_team_main_abilities: {
    type: [[String]],
    required: false,
    validate: [player_limit, "{PATH} must be 4"],
    default: [
      [null, null, null],
      [null, null, null],
      [null, null, null],
      [null, null, null]
    ]
  },
  losing_team_sub_abilities: {
    type: [[String]],
    required: false,
    validate: [player_limit, "{PATH} must be 4"],
    default: [
      [null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null]
    ]
  }
})

function player_limit(val) {
  return val.length === 4
}

module.exports = mongoose.model("Round", roundSchema)
