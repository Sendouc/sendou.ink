const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  discriminator: { type: String, required: true },
  discord_id: { type: String, required: true },
  twitch_name: String,
  twitter_name: String,
  country: String,
  sens: {
    stick: { type: Number, min: -5, max: 5 },
    motion: { type: Number, min: -5, max: 5 },
  },
  weapons: [String],
  top500: Boolean,
  plus: {
    membership_status: String,
    vouch_status: String,
    plus_region: String,
    can_vouch: Boolean,
    last_vouched: Date,
  },
})

module.exports = mongoose.model("User", userSchema)
