const mongoose = require("mongoose")

const competitiveFeedEventSchema = new mongoose.Schema({
  name: String,
  date: Date,
  description: String,
  poster_discord_id: String,
  message_discord_id: String,
  message_url: String,
  discord_invite_url: String,
  picture_url: String,
})

competitiveFeedEventSchema.virtual("poster_discord_user", {
  ref: "User",
  localField: "poster_discord_id",
  foreignField: "discord_id",
  justOne: true,
})

module.exports = mongoose.model(
  "CompetitiveFeedEvent",
  competitiveFeedEventSchema
)
