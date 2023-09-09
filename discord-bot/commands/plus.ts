import { SlashCommandBuilder } from "@discordjs/builders";
import { Client, GuildMember, Role } from "discord.js";
import invariant from "tiny-invariant";
import ids from "../ids";
import type { BotCommand } from "../types";
import { plusTierToRoleId, usersWithAccess } from "../utils";

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
        .setRequired(true),
    ),
  // @ts-expect-error TODO: fix. Library doesn't seem to extract API Message type so I could fix this error?
  execute: async ({ interaction, client }) => {
    const isDryRun = interaction.options.getBoolean(ACTION_ARG);

    await interaction.deferReply({ ephemeral: true });

    const { users } = await usersWithAccess();

    let removed = 0;
    let added = 0;

    for (const { member, roleIds } of await membersWithPlusRoles(client)) {
      const userMemberStatus = users[member.id];
      const roleIdToGive = plusTierToRoleId(userMemberStatus);

      const roleIdsToRemove = roleIds.filter((id) => id !== roleIdToGive);

      for (const idToRemove of roleIdsToRemove) {
        if (!isDryRun) await member.roles.remove(idToRemove);
        removed++;
      }

      if (roleIdToGive && !roleIds.includes(roleIdToGive)) {
        if (!isDryRun) await member.roles.add(roleIdToGive);
        added++;
      }
    }

    return interaction.editReply(`Removed ${removed} roles, gave ${added}.`);
  },
};

async function membersWithPlusRoles(client: Client<boolean>) {
  const plusServer = client.guilds.cache.find(
    (g) => g.id === ids.guilds.plusServer,
  );
  invariant(plusServer);

  const plusOne = await plusServer.roles.fetch(ids.roles.plusOne);
  const plusTwo = await plusServer.roles.fetch(ids.roles.plusTwo);
  const plusThree = await plusServer.roles.fetch(ids.roles.plusThree);

  const memberIdToRoles = new Map<
    string,
    { member: GuildMember; roleIds: string[] }
  >();

  for (const role of [plusOne, plusTwo, plusThree]) {
    invariant(role);

    for (const [, member] of role.members) {
      const value = memberIdToRoles.get(member.id) ?? { member, roleIds: [] };

      value.roleIds.push(role.id);
      memberIdToRoles.set(member.id, value);
    }
  }

  return Array.from(memberIdToRoles.values()).map(({ roleIds, member }) => ({
    roleIds,
    member,
  }));
}
