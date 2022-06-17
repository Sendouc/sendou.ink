import type { SlashCommandBuilder } from "@discordjs/builders";
import type { Client, CommandInteraction } from "discord.js";

export interface BotCommand {
  name: string;
  /** ID's of guilds where this command will be set */
  guilds: string[];
  builder: Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">; // TODO: figure out correct type here
  execute: (commandParameters: {
    interaction: CommandInteraction;
    client: Client;
  }) => Promise<void>;
}
