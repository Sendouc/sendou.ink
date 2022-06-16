import type {
  SlashCommandBuilder,
  SlashCommandSubcommandsOnlyBuilder,
} from "@discordjs/builders";
import type { CommandInteraction } from "discord.js";

export interface BotCommand {
  name: string;
  /** ID's of guilds where this command will be set */
  guilds: string[];
  builder: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder;
  execute: (commandParameters: {
    interaction: CommandInteraction;
  }) => Promise<void>;
}
