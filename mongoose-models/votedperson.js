const mongoose = require("mongoose")

const votedPersonSchema = new mongoose.Schema({
  discord_id: { type: String, required: true },
  voter_discord_id: { type: String, required: true },
  score: { type: Number, required: true },
  month: { type: Number, required: true },
  year: { type: Number, required: true },
  plus_server: { type: String, required: true },
  stale: Boolean,
})

votedPersonSchema.virtual("discord_user", {
  ref: "User",
  localField: "discord_id",
  foreignField: "discord_id",
  justOne: true,
})

votedPersonSchema.virtual("voter_discord_user", {
  ref: "User",
  localField: "voter_discord_id",
  foreignField: "discord_id",
  justOne: true,
})

module.exports = mongoose.model("VotedPerson", votedPersonSchema)
