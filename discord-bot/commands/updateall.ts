import { SlashCommandBuilder } from "@discordjs/builders";
import { Client } from "discord.js";
import invariant from "tiny-invariant";
import type { User } from "../../app/db/types";
import ids from "../ids";
import type { BotCommand } from "../types";
import { sendouInkFetch } from "../utils";

const COMMAND_NAME = "updateall";

const guildsToCrawlForUpdates = [ids.guilds.plusServer, ids.guilds.sendou];

export const updateAllCommand: BotCommand = {
  guilds: [ids.guilds.adminServer],
  name: COMMAND_NAME,
  builder: new SlashCommandBuilder()
    .setName(COMMAND_NAME)
    .setDescription("Update sendou.ink usernames and avatars"),
  // @ts-expect-error TODO: fix. Library doesn't seem to extract API Message type so I could fix this error?
  execute: async ({ interaction, client }) => {
    await interaction.deferReply({ ephemeral: true });

    const userUpdates = await getUsersToUpdate(client);
    const response = await sendouInkFetch("/users", {
      method: "post",
      body: JSON.stringify(userUpdates),
    });

    if (!response.ok) {
      return interaction.editReply(
        `Update failed with status code ${response.status}`
      );
    }

    return interaction.editReply(`Sent ${userUpdates.length} users`);
  },
};

async function getUsersToUpdate(client: Client<boolean>) {
  const usersSeen = new Set<string>();
  const userUpdates: Array<
    Pick<
      User,
      "discordId" | "discordName" | "discordDiscriminator" | "discordAvatar"
    >
  > = [];
  for (const guildId of guildsToCrawlForUpdates) {
    const guild = client.guilds.cache.find((g) => g.id === guildId);
    invariant(guild);

    for (const [, { user }] of await guild.members.fetch()) {
      if (usersSeen.has(user.id)) continue;

      userUpdates.push({
        discordId: user.id,
        discordAvatar: user.avatar,
        discordDiscriminator: user.discriminator,
        discordName: user.username,
      });

      usersSeen.add(user.id);
    }
  }

  return userUpdates;
}
