const mongoose = require("mongoose")

const faLikeSchema = new mongoose.Schema({
  liker_discord_id: String,
  liked_discord_id: String,
})

faLikeSchema.virtual("liked_discord_user", {
  ref: "User",
  localField: "liked_discord_id",
  foreignField: "discord_id",
  justOne: true,
})

module.exports = mongoose.model("FALike", faLikeSchema)
