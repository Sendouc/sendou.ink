const mongoose = require("mongoose")

const detailedTournamentSchema = new mongoose.Schema({
  name: String,
  bracket_url: String,
  date: Date,
  top_3_team_names: [[String]],
  top_3_discord_ids: [[String]],
})

module.exports = mongoose.model("DetailedTournament", detailedTournamentSchema)
