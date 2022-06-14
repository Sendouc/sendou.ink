import "dotenv/config";

import { SlashCommandBuilder } from "@discordjs/builders";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import invariant from "tiny-invariant";

invariant(process.env["BOT_TOKEN"], "DISCORD_TOKEN must be set");
invariant(process.env["BOT_ID"], "BOT_ID must be set");
invariant(process.env["TEST_GUILD_ID"], "TEST_GUILD_ID must be set");

const commands = [
  new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with pong!"),
].map((command) => command.toJSON());

const rest = new REST({ version: "9" }).setToken(process.env["BOT_TOKEN"]);

rest
  .put(
    Routes.applicationGuildCommands(
      process.env["BOT_ID"],
      process.env["TEST_GUILD_ID"]
    ),
    { body: commands }
  )
  .then(() => console.log("Successfully registered application commands."))
  .catch(console.error);
