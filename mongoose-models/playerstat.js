const mongoose = require("mongoose");

const playerStatSchema = new mongoose.Schema({
  discord_id: String,
  weapon: String,
  kills: Number,
  assists: Number,
  deaths: Number,
  specials: Number,
  paint: Number,
  seconds_played: Number,
  games_played: Number,
  wins: Number,
  type: String,
});

module.exports = mongoose.model("PlayerStat", playerStatSchema);
