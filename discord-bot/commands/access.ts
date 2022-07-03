import { SlashCommandBuilder } from "@discordjs/builders";
import { GuildMemberRoleManager } from "discord.js";
import ids from "../ids";
import type { BotCommand } from "../types";
import { isPlusTierRoleId, plusTierToRoleId, usersWithAccess } from "../utils";

const COMMAND_NAME = "access";

export const accessCommand: BotCommand = {
  guilds: [ids.guilds.plusServer],
  name: COMMAND_NAME,
  builder: new SlashCommandBuilder()
    .setName(COMMAND_NAME)
    .setDescription(
      "Get the corresponding Plus Server membership role if you have access"
    ),
  execute: async ({ interaction }) => {
    const { users } = await usersWithAccess();
    const usersPlusTier = users[interaction.user.id];

    if (!usersPlusTier) {
      return interaction.reply({
        content: "You currently don't have access",
        ephemeral: true,
      });
    }

    const targetRoleId = plusTierToRoleId(usersPlusTier);
    if (!targetRoleId) {
      throw new Error(`No role for plus tier ${usersPlusTier}`);
    }

    const roleManager = interaction.member?.roles as GuildMemberRoleManager;
    const usersRoleIds = roleManager.cache.map((r) => r.id);
    const alreadyHasRole = usersRoleIds.some((id) => id === targetRoleId);

    if (alreadyHasRole) {
      return interaction.reply({
        content: `You have access to +${usersPlusTier} and already have the role for it`,
        ephemeral: true,
      });
    }

    const roleIdsToDelete = usersRoleIds.filter(isPlusTierRoleId);

    for (const roleIdToDelete of roleIdsToDelete) {
      await roleManager.remove(roleIdToDelete);
    }

    await roleManager.add(targetRoleId);

    return interaction.reply({
      content: `Gave the role giving access to +${usersPlusTier}`,
      ephemeral: true,
    });
  },
};
