const mongoose = require("mongoose")

const summarySchema = new mongoose.Schema({
  discord_id: { type: String, required: true },
  suggester_discord_id: String,
  voucher_discord_id: String,
  plus_server: { type: String, required: true },
  month: { type: Number, required: true },
  year: { type: Number, required: true },
  score: { type: Number, required: true },
})

module.exports = mongoose.model("SummaryPerson", summarySchema)
