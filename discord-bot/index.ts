// Require the necessary discord.js classes
import { Client, Intents } from "discord.js";
import "dotenv/config";
import invariant from "tiny-invariant";

invariant(process.env["BOT_TOKEN"], "DISCORD_TOKEN must be set");

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

client.once("ready", () => {
  console.log("Ready!");
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  if (commandName === "ping") {
    await interaction.reply("Pong!");
  }
});

client.login(process.env["BOT_TOKEN"]).catch((err) => console.error(err));
