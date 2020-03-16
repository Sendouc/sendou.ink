const mongoose = require("mongoose")

const buildSchema = new mongoose.Schema(
  {
    discord_id: { type: String, required: true },
    weapon: { type: String, required: true },
    title: { type: String, required: false },
    description: { type: String, required: false },
    headgear: { type: [String], required: true },
    headgearItem: { type: String, required: false },
    clothing: { type: [String], required: true },
    clothingItem: { type: String, required: false },
    shoes: { type: [String], required: true },
    shoesItem: { type: String, required: false },
    top: { type: Boolean },
  },
  { timestamps: true }
)

buildSchema.virtual("discord_user", {
  ref: "User",
  localField: "discord_id",
  foreignField: "discord_id",
  justOne: true,
})

module.exports = mongoose.model("Build", buildSchema)
