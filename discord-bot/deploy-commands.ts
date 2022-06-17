import "dotenv/config";

import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import invariant from "tiny-invariant";
import { commands } from "./commands";

invariant(process.env["BOT_TOKEN"], "DISCORD_TOKEN must be set");
invariant(process.env["BOT_ID"], "BOT_ID must be set");
// xxx: not really TEST_GUILD_ID must be set
invariant(process.env["TEST_GUILD_ID"], "TEST_GUILD_ID must be set");

const serializedCommands = commands.map((cmd) => cmd.builder.toJSON());

const rest = new REST({ version: "9" }).setToken(process.env["BOT_TOKEN"]);

rest
  .put(
    Routes.applicationGuildCommands(
      process.env["BOT_ID"],
      process.env["TEST_GUILD_ID"]
    ),
    { body: serializedCommands } // TODO: divide by guild
  )
  // eslint-disable-next-line no-console
  .then(() => console.log("Successfully registered application commands."))
  .catch(console.error);
