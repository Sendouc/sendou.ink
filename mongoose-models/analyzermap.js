const mongoose = require("mongoose")

const Player = {
  unique_id: String,
  weapon: String,
  main_abilities: [String],
  sub_abilities: [[String]],
  kills: Number,
  assists: Number,
  deaths: Number,
  specials: Number,
  paint: Number,
}

const TeamInfo = {
  players: [Player],
  score: Number,
}

const analyzerMapSchema = new mongoose.Schema({
  date: Date,
  hash: String,
  stage: String,
  mode: String,
  duration: Number,
  winners: TeamInfo,
  losers: TeamInfo,
})

analyzerMapSchema.virtual("winners.players.discord_user", {
  ref: "User",
  localField: "winners.players.discord_id",
  foreignField: "discord_id",
  justOne: true,
})

analyzerMapSchema.virtual("losers.players.discord_user", {
  ref: "User",
  localField: "losers.players.discord_id",
  foreignField: "discord_id",
  justOne: true,
})

module.exports = mongoose.model("AnalyzerMap", analyzerMapSchema)
