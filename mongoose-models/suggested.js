const mongoose = require("mongoose")

const suggestedSchema = new mongoose.Schema({
  discord_id: { type: String, required: true },
  suggester_discord_id: { type: String, required: true },
  plus_region: { type: String, required: true },
  plus_server: { type: String, required: true },
  description: { type: String, required: true },
})

module.exports = mongoose.model("Suggested", suggestedSchema)
