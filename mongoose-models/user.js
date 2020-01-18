const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  discriminator: { type: String, required: true },
  discord_id: { type: String, required: true },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team",
  },
  twitch_name: String,
  twitter_name: String,
  country: String,
  sens: {
    stick: { type: Number, min: -5, max: 5 },
    motion: { type: Number, min: -5, max: 5 },
  },
  weapons: [String],
  top500: Boolean,
  custom_url: String,
  plus: {
    membership_status: String,
    vouch_status: String,
    voucher_discord_id: String,
    plus_region: String,
    can_vouch: String,
    can_vouch_again_after: Date,
  },
})

userSchema.virtual("plus.voucher_user", {
  ref: "User",
  localField: "plus.voucher_discord_id",
  foreignField: "discord_id",
  justOne: true,
})

module.exports = mongoose.model("User", userSchema)
