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
  stage: String,
  mode: String,
  duration: Number,
  winners: TeamInfo,
  losers: TeamInfo,
}

const detailedMatchSchema = new mongoose.Schema({
  tournament_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "DetailedTournament",
  },
  round_number: Number,
  round_name: String,
  map_details: [Map],
  type: String,
})

detailedMatchSchema.virtual("map_details.winners.players.discord_user", {
  ref: "User",
  localField: "map_details.winners.players.discord_id",
  foreignField: "discord_id",
  justOne: true,
})

detailedMatchSchema.virtual("map_details.losers.players.discord_user", {
  ref: "User",
  localField: "map_details.losers.players.discord_id",
  foreignField: "discord_id",
  justOne: true,
})

module.exports = mongoose.model("DetailedMatch", detailedMatchSchema)
