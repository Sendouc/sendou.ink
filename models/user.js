const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  username: {type: String, required: true},
  discriminator: {type: String, required: true},
  avatar: {type: String},
  discord_id: {type: String, required: true},
  twitch_name: {type: String},
  twitter_name: {type: String}
})

module.exports = mongoose.model('User', userSchema)