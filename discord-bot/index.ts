// Require the necessary discord.js classes
import { Client, Intents } from "discord.js";
import "dotenv/config";
import invariant from "tiny-invariant";
import { commandsMap } from "./commands";

invariant(process.env["BOT_TOKEN"], "DISCORD_TOKEN must be set");

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

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

  return command.execute({ interaction, client }).catch(console.error);
});

client.login(process.env["BOT_TOKEN"]).catch((err) => console.error(err));
