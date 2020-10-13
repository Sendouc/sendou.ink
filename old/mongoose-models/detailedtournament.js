const mongoose = require("mongoose");

const detailedTournamentSchema = new mongoose.Schema({
  name: String,
  bracket_url: String,
  date: Date,
  top_3_team_names: [String],
  top_3_discord_ids: [[String]],
  participant_discord_ids: [String],
  type: String,
});

detailedTournamentSchema.virtual("top_3_discord_users", {
  ref: "User",
  localField: "top_3_discord_ids",
  foreignField: "discord_id",
});

module.exports = mongoose.model("DetailedTournament", detailedTournamentSchema);
