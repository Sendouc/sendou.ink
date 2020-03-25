const mongoose = require("mongoose")

const Player = {
  discord_id: String,
  weapon: String,
  main_abilities: [String],
  sub_abilities: [[String]],
  kills: Number,
  assists: Number,
  deaths: Number,
  specials: Number,
  paint: Number,
  gear: [String],
}

const TeamInfo = {
  team_name: String,
  players: [Player],
  score: Number,
}

const Map = {
  tournament_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "DetailedTournament",
  },
  stage: String,
  mode: String,
  duration: Number,
  winners: TeamInfo,
  losers: TeamInfo,
}

const detailedMatchSchema = new mongoose.Schema({
  round_number: Number,
  round_name: String,
  match_details: [Map],
  type: String,
})

module.exports = mongoose.model("DetailedMatch", detailedMatchSchema)
