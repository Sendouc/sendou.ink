const mongoose = require("mongoose")

const votedPersonSchema = new mongoose.Schema({
  discord_id: { type: String, required: true },
  voter_discord_id: { type: String, required: true },
  score: { type: Number, required: true },
  month: { type: Number, required: true },
  year: { type: Number, required: true },
  plus_server: { type: String, required: true },
})

module.exports = mongoose.model("VotedPerson", votedPersonSchema)
