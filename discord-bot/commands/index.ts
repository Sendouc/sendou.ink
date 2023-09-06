import { questionCommand } from "./q";
import { lfgRoleCommand } from "./lfg";
import { accessCommand } from "./access";
import { plusCommand } from "./plus";
import { updateAllCommand } from "./updateall";
import { pingRolesCommand } from "./pings";
import { colorCommand } from "./color";
import { loginCommand, updateProfileCommand } from "./login";
import type { BotCommand } from "../types";

export const commands = [
  questionCommand,
  lfgRoleCommand,
  accessCommand,
  plusCommand,
  updateAllCommand,
  pingRolesCommand,
  colorCommand,
  loginCommand,
  updateProfileCommand,
];

export const commandsMap = Object.fromEntries(commands.map((c) => [c.name, c]));

interface CommandsPerGuilds {
  guildId: string;
  commands: BotCommand[];
}
export function commandsPerGuild() {
  const result: CommandsPerGuilds[] = [];

  for (const command of commands) {
    for (const guildId of command.guilds) {
      const guildsCommands = result.find((c) => c.guildId === guildId);

      if (!guildsCommands) {
        const guildsCommands: CommandsPerGuilds = {
          guildId,
          commands: [],
        };
        guildsCommands.commands.push(command);
        result.push(guildsCommands);
        continue;
      }

      guildsCommands.commands.push(command);
    }
  }

  return result;
}
