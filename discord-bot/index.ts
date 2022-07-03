// Require the necessary discord.js classes
import { Client, Intents } from "discord.js";
import "dotenv/config";
import invariant from "tiny-invariant";
import { commandsMap } from "./commands";

invariant(process.env["BOT_TOKEN"], "DISCORD_TOKEN must be set");

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS],
});

client.once("ready", () => {
  // eslint-disable-next-line no-console
  console.log("Ready!");
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;
  const command = commandsMap[commandName];

  if (!command) {
    throw new Error(
      `I don't know how to handle the command called "${commandName}"`
    );
  }

  try {
    await command.execute({ interaction, client });
  } catch (e) {
    console.error(e);
  }
});

client.login(process.env["BOT_TOKEN"]).catch((err) => console.error(err));
