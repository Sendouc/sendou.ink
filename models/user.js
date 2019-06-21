const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  username: {type: String, required: true},
  discriminator: {type: String, required: true},
  avatar: {type: String},
  discord_id: {type: String, required: true},
  twitch_name: {type: String},
  twitter_name: {type: String},
  solo_power: {type: [Number], default: [25.0, 25.0/3.0]},
  solo_wins: {type: Number, default: 0},
  solo_losses: {type: Number, default: 0},
  previous_opponents: {type: [String]}
})

module.exports = mongoose.model('User', userSchema)