import { SlashCommandBuilder } from "@discordjs/builders";
import type { GuildMemberRoleManager } from "discord.js";
import ids from "../ids";
import type { BotCommand } from "../types";
import { patronsFiveDollarsAndOver } from "../utils";

const COMMAND_NAME = "color";
const ACTION_ARG = "hex";
const ADMIN_DISCORD_ID = "79237403620945920";

export const colorCommand: BotCommand = {
  guilds: [ids.guilds.plusServer, ids.guilds.sendou],
  name: COMMAND_NAME,
  builder: new SlashCommandBuilder()
    .setName(COMMAND_NAME)
    .setDescription(
      "Get/update color role (Supporter tier on Patreon or higher needed)",
    )
    .addStringOption((option) =>
      option
        .setName(ACTION_ARG)
        .setDescription("Hex code of the color role")
        .setRequired(true),
    ),
  execute: async ({ interaction, client }) => {
    let hexCode = interaction.options.getString(ACTION_ARG);
    if (!hexCode.startsWith("#")) {
      hexCode = `#${hexCode}`;
    }

    if (!validateHexCode(hexCode)) {
      return interaction.reply({
        content:
          "Hex code is invalid. Google color picker to find a valid one or DM Sendou for help.",
        ephemeral: true,
      });
    }

    const patrons = await patronsFiveDollarsAndOver();

    if (
      !patrons.some((p) => p.discordId === interaction.user.id) &&
      interaction.user.id !== ADMIN_DISCORD_ID
    ) {
      return interaction.reply({
        content:
          "This command is only available to patrons of 'Supporter' tier or higher https://www.patreon.com/sendou",
        ephemeral: true,
      });
    }

    const memberRoles = interaction.member?.roles as GuildMemberRoleManager;

    const roleToUpdate = memberRoles.cache.find((role) =>
      role.name.includes("!"),
    );

    if (roleToUpdate) {
      await roleToUpdate.edit({ color: hexCode });
    } else {
      const role = await interaction.guild!.roles.create({
        color: hexCode,
        name: `${interaction.user.username}!`,
        position: 10,
      });

      await memberRoles.add(role);
    }

    return interaction.reply({
      content: roleToUpdate ? "Role updated" : "Role created",
      ephemeral: true,
    });
  },
};

function validateHexCode(hexCode: string) {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hexCode);
}
