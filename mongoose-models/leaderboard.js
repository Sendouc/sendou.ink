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

module.exports = mongoose.model("Leaderboard", leaderboardSchema)
