const mongoose = require("mongoose")

const faLikeSchema = new mongoose.Schema({
  liker_discord_id: String,
  liked_discord_id: String,
})

/*mapBallotSchema.virtual("liker_discord_id", {
  ref: "User",
  localField: "discord_id",
  foreignField: "discord_id",
  justOne: true,
})*/

module.exports = mongoose.model("FALike", faLikeSchema)
