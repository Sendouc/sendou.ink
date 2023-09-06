import { SlashCommandBuilder } from "@discordjs/builders";
import type { GuildMemberRoleManager, User } from "discord.js";
import ids from "../ids";
import type { BotCommand } from "../types";
import { sendouInkFetch } from "../utils";

const LOGIN_COMMAND_NAME = "login";

// xxx: second command for just updating
export const loginCommand: BotCommand = {
  guilds: [ids.guilds.plusServer, ids.guilds.sendou],
  name: LOGIN_COMMAND_NAME,
  builder: new SlashCommandBuilder()
    .setName(LOGIN_COMMAND_NAME)
    .setDescription("Get log in link for sendou.ink"),
  execute: async ({ interaction }) => {
    const user = interaction.member?.user as User;
    if (!user) {
      return interaction.reply({
        content: "Something went wrong",
      });
    }

    const hasUniqueUsername = user.discriminator === "0";

    const discordName = hasUniqueUsername ? user.globalName : user.username;
    const discordUniqueName = hasUniqueUsername ? user.username : null;
    if (!discordName || !discordUniqueName) {
      return interaction.reply({
        content:
          "Can't log in with account that is missing the new kind of Discord username",
      });
    }

    const searchParams = new URLSearchParams(
      user.avatar
        ? {
            discordId: user.id,
            discordAvatar: user.avatar,
            discordName,
            discordUniqueName,
          }
        : { discordId: user.id, discordName, discordUniqueName },
    );

    const response = await sendouInkFetch(`/auth/create-link?${searchParams}`, {
      method: "post",
    });

    const { code } = await response.json();

    return interaction.reply({
      content: `Use the link below to log in to sendou.ink - link is active for 24 hours. ⚠️ Don't share this link with others as it will allow them to log in to your account.\n\nhttps://sendou.ink/auth/login?code=${code}`,
      ephemeral: true,
    });
  },
};
