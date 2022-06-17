import "dotenv/config";

import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import invariant from "tiny-invariant";
import { commands, commandsPerGuild } from "./commands";

invariant(process.env["BOT_TOKEN"], "DISCORD_TOKEN must be set");
invariant(process.env["BOT_ID"], "BOT_ID must be set");

const rest = new REST({ version: "9" }).setToken(process.env["BOT_TOKEN"]);

if (process.env.NODE_ENV !== "production") {
  invariant(process.env["TEST_GUILD_ID"], "TEST_GUILD_ID must be set");
  const serializedCommands = commands.map((cmd) => cmd.builder.toJSON());
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
} else {
  for (const guildsCommands of commandsPerGuild()) {
    const serializedCommands = guildsCommands.commands.map((cmd) =>
      cmd.builder.toJSON()
    );

    rest
      .put(
        Routes.applicationGuildCommands(
          process.env["BOT_ID"],
          guildsCommands.guildId
        ),
        { body: serializedCommands }
      )
      .catch(console.error);
  }

  // eslint-disable-next-line no-console
  console.log("All commands deployed");
}
