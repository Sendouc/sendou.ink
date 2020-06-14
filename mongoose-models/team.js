const mongoose = require("mongoose")

const teamSchema = new mongoose.Schema({
  name: String,
  disbanded: Boolean,
  founded: {
    month: Number,
    year: Number,
  },
  members: [
    {
      discordId: String,
      captain: Boolean,
      role: String,
    },
  ],
  pastMembersDiscordIds: [String],
  tag: String,
  inviteCode: String,
  lfPost: String,
  xpPlacements: [
    {
      discordId: String,
      mode: Number,
      weapon: String,
      month: Number,
      year: Number,
      xPower: Number,
    },
  ],
  teamXp: Number,
})

teamSchema.virtual("memberUsers", {
  ref: "User",
  localField: "members.discordId",
  foreignField: "discord_id",
})

module.exports = mongoose.model("Team", teamSchema)
