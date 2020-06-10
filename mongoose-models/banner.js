const mongoose = require("mongoose")

const bannerSchema = new mongoose.Schema({
  logoUrl: String,
  description: String,
  link: String,
  textColor: String,
  bgColor: String,
  staleAfter: Date,
})

module.exports = mongoose.model("Banner", bannerSchema)
