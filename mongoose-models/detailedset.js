const mongoose = require("mongoose")

const Player = {
  discord_id: String,
  weapon: String,
  main_abilities: [String],
  sub_abilities: [String],
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

const detailedSetSchema = new mongoose.Schema({
  tournament_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "DetailedTournament",
  },
  round_number: Number,
  game_number: Number,
  stage: String,
  mode: String,
  duration: Number,
  winners: TeamInfo,
  losers: TeamInfo,
})

module.exports = mongoose.model("DetailedSet", detailedSetSchema)
