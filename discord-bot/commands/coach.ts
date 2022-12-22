import { SlashCommandBuilder } from "@discordjs/builders";
import type { GuildMemberRoleManager } from "discord.js";
import ids from "../ids";
import type { BotCommand } from "../types";

const COMMAND_NAME = "coach";
const ACTION_ARG = "action";

export const coachRoleCommand: BotCommand = {
  guilds: [ids.guilds.sro],
  name: COMMAND_NAME,
  builder: new SlashCommandBuilder()
    .setName(COMMAND_NAME)
    .setDescription(
      "Turn on/off role indicating you are available to coach other players"
    )
    .addStringOption((option) =>
      option
        .setName(ACTION_ARG)
        .setDescription("Add or remove the role?")
        .setRequired(true)
        .addChoices(
          {
            name: "add",
            value: "add",
          },
          {
            name: "remove",
            value: "remove",
          }
        )
    ),
  execute: async ({ interaction }) => {
    const roleBeingAdded = interaction.options.getString(ACTION_ARG) === "add";
    const commandUserRoles = interaction.member
      ?.roles as GuildMemberRoleManager;

    if (roleBeingAdded) {
      await commandUserRoles.add(ids.roles.sroCoach);
    } else {
      await commandUserRoles.remove(ids.roles.sroCoach);
    }

    return interaction.reply({
      content: roleBeingAdded ? "Role added" : "Role removed",
      ephemeral: true,
    });
  },
};
