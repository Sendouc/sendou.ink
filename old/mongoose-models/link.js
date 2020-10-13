const mongoose = require("mongoose");

const linkSchema = new mongoose.Schema({
  title: { type: String, required: true },
  url: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, required: true },
});

module.exports = mongoose.model("Link", linkSchema);
