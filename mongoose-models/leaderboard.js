const mongoose = require("mongoose")

const Player = {
  discord_id: String,
  first: Number,
  second: Number,
  third: Number,
}

const leaderboardSchema = new mongoose.Schema({
  players: [Player],
  type: String,
})

leaderboardSchema.virtual("players.discord_user", {
  ref: "User",
  localField: "players.discord_id",
  foreignField: "discord_id",
  justOne: true,
})

module.exports = mongoose.model("Leaderboard", leaderboardSchema)
