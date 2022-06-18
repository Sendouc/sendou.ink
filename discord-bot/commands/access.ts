import { SlashCommandBuilder } from "@discordjs/builders";
import invariant from "tiny-invariant";
import { LOHI_TOKEN_HEADER_NAME } from "~/constants";
import type { PlusListLoaderData } from "~/routes/plus/list";
import ids from "../ids";
import type { BotCommand } from "../types";

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

    if (!users.some((u) => u.discordId === interaction.user.id)) {
      return interaction.reply("You currently don't have access");
    }

    // TODO: logic to change roles here
    return interaction.reply("ok");
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
