import { SlashCommandBuilder } from "@discordjs/builders";
import { GuildMemberRoleManager } from "discord.js";
import invariant from "tiny-invariant";
import { LOHI_TOKEN_HEADER_NAME } from "~/constants";
import type { PlusListLoaderData } from "~/routes/plus/list";
import ids from "../ids";
import type { BotCommand } from "../types";

const COMMAND_NAME = "access";

const plusTierRoles = [
  "",
  ids.roles.plusOne,
  ids.roles.plusTwo,
  ids.roles.plusThree,
] as const;

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
    const ownUser = users.find((u) => u.discordId === interaction.user.id);

    if (!ownUser) {
      return interaction.reply({
        content: "You currently don't have access",
        ephemeral: true,
      });
    }

    const targetRoleId = plusTierRoles[ownUser.plusTier];
    if (!targetRoleId) {
      throw new Error(`No role for plus tier "${ownUser.plusTier}"`);
    }

    const roleManager = interaction.member?.roles as GuildMemberRoleManager;
    const usersRoleIds = roleManager.cache.map((r) => r.id);
    const alreadyHasRole = usersRoleIds.some((id) => id === targetRoleId);

    if (alreadyHasRole) {
      return interaction.reply({
        content: `You have access to +${ownUser.plusTier} and already have the role for it`,
        ephemeral: true,
      });
    }

    const roleIdsToDelete = usersRoleIds.filter((id) =>
      plusTierRoles.includes(id as any)
    );

    for (const roleIdToDelete of roleIdsToDelete) {
      await roleManager.remove(roleIdToDelete);
    }

    await roleManager.add(targetRoleId);

    return interaction.reply({
      content: `Gave the role giving access to +${ownUser.plusTier}`,
      ephemeral: true,
    });
  },
};

async function usersWithAccess(): Promise<PlusListLoaderData> {
  invariant(process.env["SENDOU_INK_URL"], "SENDOU_INK_URL is not set");
  invariant(process.env["LOHI_TOKEN"], "LOHI_TOKEN is not set");

  const response = await fetch(`${process.env["SENDOU_INK_URL"]}/plus/list`, {
    headers: [[LOHI_TOKEN_HEADER_NAME, process.env["LOHI_TOKEN"]]],
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch users. Response status was ${response.status}`
    );
  }

  return response.json();
}
