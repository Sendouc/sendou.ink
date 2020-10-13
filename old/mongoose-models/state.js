const mongoose = require("mongoose");

const stateSchema = new mongoose.Schema({
  voting_ends: Date,
});

module.exports = mongoose.model("State", stateSchema);
