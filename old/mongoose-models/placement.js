const mongoose = require("mongoose");

const placementSchema = new mongoose.Schema({
  name: { type: String, required: true },
  weapon: { type: String, required: true },
  rank: { type: Number, min: 1, max: 500, required: true },
  mode: { type: Number, min: 1, max: 4, required: true },
  x_power: { type: Number, required: true },
  unique_id: { type: String, required: true },
  month: { type: Number, min: 1, max: 12, required: true },
  year: { type: Number, min: 2017, required: true },
});

placementSchema.virtual("player", {
  ref: "Player",
  localField: "unique_id",
  foreignField: "unique_id",
  justOne: true,
});

module.exports = mongoose.model("Placement", placementSchema);
