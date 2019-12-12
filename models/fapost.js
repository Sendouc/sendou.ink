const mongoose = require("mongoose")

const faPostSchema = new mongoose.Schema(
  {
    discord_id: { type: String, required: true },
    can_vc: { type: String, required: true },
    playstyles: { type: [String], required: true },
    activity: String,
    past_experience: String,
    looking_for: String,
    description: String,
    hidden: { type: Boolean, default: false },
  },
  { timestamps: true }
)

faPostSchema.virtual("discord_user", {
  ref: "User",
  localField: "discord_id",
  foreignField: "discord_id",
  justOne: true,
})

module.exports = mongoose.model("FAPost", faPostSchema)
