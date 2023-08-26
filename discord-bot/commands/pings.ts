import { SlashCommandBuilder } from "@discordjs/builders";
import type { GuildMemberRoleManager } from "discord.js";
import ids from "../ids";
import type { BotCommand } from "../types";

const COMMAND_NAME = "pings";
const TIER_ARG = "tier";
const ACTION_ARG = "action";

export const pingRolesCommand: BotCommand = {
  guilds: [ids.guilds.plusServer],
  name: COMMAND_NAME,
  builder: new SlashCommandBuilder()
    .setName(COMMAND_NAME)
    .setDescription(
      "Turn on/off pings when people are looking for someone to play with",
    )
    .addStringOption((option) =>
      option
        .setName(TIER_ARG)
        .setDescription("+2 or +3?")
        .setRequired(true)
        .addChoices(
          {
            name: "+2",
            value: "+2",
          },
          {
            name: "+3",
            value: "+3",
          },
        ),
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
          },
        ),
    ),
  execute: async ({ interaction }) => {
    const roleBeingAdded = interaction.options.getString(ACTION_ARG) === "add";
    const tier = interaction.options.getString(TIER_ARG);
    const role =
      tier === "+2" ? ids.roles.plusTwoPings : ids.roles.plusThreePings;
    const commandUserRoles = interaction.member
      ?.roles as GuildMemberRoleManager;

    if (roleBeingAdded) {
      await commandUserRoles.add(role);
    } else {
      await commandUserRoles.remove(role);
    }

    return interaction.reply({
      content: `${tier} pings role ${roleBeingAdded ? "added" : "removed"}`,
      ephemeral: true,
    });
  },
};
