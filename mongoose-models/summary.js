const mongoose = require("mongoose")

const summarySchema = new mongoose.Schema({
  discord_id: { type: String, required: true },
  plus_server: { type: String, required: true },
  month: { type: Number, required: true },
  year: { type: Number, required: true },
  score: {
    total: { type: Number, required: true, min: 0, max: 100 },
    eu: { type: Number, required: true, min: 0, max: 100 },
    na: { type: Number, required: true, min: 0, max: 100 },
  },
})

module.exports = mongoose.model("SummaryPerson", summarySchema)
