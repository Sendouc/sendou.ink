const mongoose = require("mongoose")

const ballotSchema = new mongoose.Schema({
  discord_id: { type: String, required: true },
  plus_server: { type: String, required: true },
  month: { type: Number, required: true },
  year: { type: Number, required: true },
  votes: { type: [mongoose.Schema.Types.ObjectId], required: true },
})

module.exports = mongoose.model("BallotPerson", ballotSchema)
