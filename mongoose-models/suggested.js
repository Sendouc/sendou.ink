const mongoose = require("mongoose");

const suggestedSchema = new mongoose.Schema(
  {
    discord_id: { type: String, required: true },
    suggester_discord_id: { type: String, required: true },
    plus_region: { type: String, required: true },
    plus_server: { type: String, required: true },
    description: { type: String, required: true },
  },
  { timestamps: true }
);

suggestedSchema.virtual("discord_user", {
  ref: "User",
  localField: "discord_id",
  foreignField: "discord_id",
  justOne: true,
});

suggestedSchema.virtual("suggester_discord_user", {
  ref: "User",
  localField: "suggester_discord_id",
  foreignField: "discord_id",
  justOne: true,
});

module.exports = mongoose.model("Suggested", suggestedSchema);
