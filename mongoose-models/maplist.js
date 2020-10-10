const mongoose = require("mongoose");

const maplistSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sz: { type: [String], required: true },
  tc: { type: [String], required: true },
  rm: { type: [String], required: true },
  cb: { type: [String], required: true },
  order: Number,
  plus: {
    month: Number,
    year: Number,
    voter_count: Number,
    vote_counts: [
      {
        name: String,
        sz: [Number],
        tc: [Number],
        rm: [Number],
        cb: [Number],
      },
    ],
  },
});

module.exports = mongoose.model("Maplist", maplistSchema);
