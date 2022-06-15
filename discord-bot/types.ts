import type { SlashCommandBuilder } from "@discordjs/builders";
import type { CommandInteraction } from "discord.js";

export interface BotCommand {
  name: string;
  // description: string;
  // /** ID's of guilds where this command will be set */
  // guilds: string[];
  builder: SlashCommandBuilder;
  execute: (commandParameters: {
    interaction: CommandInteraction;
  }) => Promise<void>;
}
