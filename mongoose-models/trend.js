const mongoose = require("mongoose");

const trendSchema = new mongoose.Schema({
  weapon: { type: String, required: true },
  counts: [
    {
      year: Number,
      SZ: [Number],
      TC: [Number],
      RM: [Number],
      CB: [Number],
    },
  ],
});

module.exports = mongoose.model("Trend", trendSchema);
