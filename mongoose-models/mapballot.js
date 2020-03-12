const mongoose = require("mongoose")

const mapBallotSchema = new mongoose.Schema({
  discord_id: String,
  maps: [
    {
      name: String,
      sz: Number,
      tc: Number,
      rm: Number,
      cb: Number,
    },
  ],
})

mapBallotSchema.virtual("discord_user", {
  ref: "User",
  localField: "discord_id",
  foreignField: "discord_id",
  justOne: true,
})

module.exports = mongoose.model("MapBallot", mapBallotSchema)
