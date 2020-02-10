const mongoose = require("mongoose")

const teamSchema = new mongoose.Schema({
  name: String,
  twitter_name: String,
  captain_discord_id: String,
  member_discord_ids: [String],
  countries: [String],
  tag: String,
  invite_code: String,
  lf_post: String,
  tournament_results: [
    {
      date: Date,
      tweet_url: String,
      tournament_name: String,
      placement: Number,
    },
  ],
})

teamSchema.virtual("member_users", {
  ref: "User",
  localField: "member_discord_ids",
  foreignField: "discord_id",
})

module.exports = mongoose.model("Team", teamSchema)
