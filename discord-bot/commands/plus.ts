import { SlashCommandBuilder } from "@discordjs/builders";
import invariant from "tiny-invariant";
import ids from "../ids";
import type { BotCommand } from "../types";
import { isPlusTierRoleId, plusTierToRoleId, usersWithAccess } from "../utils";

const COMMAND_NAME = "plus";
const ACTION_ARG = "dry";

export const plusCommand: BotCommand = {
  guilds: [ids.guilds.adminServer],
  name: COMMAND_NAME,
  builder: new SlashCommandBuilder()
    .setName(COMMAND_NAME)
    .setDescription("Remove roles from Plus Server from people who lost access")
    .addBooleanOption((option) =>
      option
        .setName(ACTION_ARG)
        .setDescription("If true doesn't remove or give roles")
        .setRequired(true)
    ),
  // @ts-expect-error TODO: fix. Library doesn't seem to extract API Message type so I could fix this error?
  execute: async ({ interaction, client }) => {
    const isDryRun = interaction.options.getBoolean(ACTION_ARG);

    await interaction.deferReply({ ephemeral: true });

    const { users } = await usersWithAccess();

    const plusServer = client.guilds.cache.find(
      (g) => g.id === ids.guilds.plusServer
    );
    invariant(plusServer);

    let removed = 0;
    let added = 0;

    for (const [, member] of await plusServer.members.fetch()) {
      const usersPlusMemberRoleIds = member.roles.cache
        .filter((role) => isPlusTierRoleId(role.id))
        .map((r) => r.id);

      const userMemberStatus = users[member.id];
      const roleToGive = plusTierToRoleId(userMemberStatus);

      const rolesToRemove = usersPlusMemberRoleIds.filter(
        (id) => id !== roleToGive
      );

      for (const idToRemove of rolesToRemove) {
        if (!isDryRun) await member.roles.remove(idToRemove);
        removed++;
      }

      if (roleToGive && !usersPlusMemberRoleIds.includes(roleToGive)) {
        if (!isDryRun) await member.roles.add(roleToGive);
        added++;
      }
    }

    return interaction.editReply(
      `Removed ${removed} roles, gave ${added}. Members in server: ${
        plusServer!.members.cache.size
      }`
    );
  },
};
