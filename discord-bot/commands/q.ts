import type { BotCommand } from "../types";
import ids from "../ids";
import { SlashCommandBuilder } from "@discordjs/builders";
import groupedLinks from "./q-data.json";

const COMMAND_NAME = "q";
const WAVE_ARG = "wave";

type Wave = "seeking" | "grillers" | "rush";

export const questionCommand: BotCommand = {
  name: COMMAND_NAME,
  guilds: [ids.guilds.sro],
  builder: addSubcommands(
    new SlashCommandBuilder()
      .setName(COMMAND_NAME)
      .setDescription("Find a link")
  ),
  execute: async ({ interaction }) => {
    let value: string | string[] | Record<Wave, string | string[]> =
      groupedLinks[
        interaction.options.getSubcommand() as keyof typeof groupedLinks
      ];
    if (typeof value === "string") {
      return interaction.reply({ content: toContent(value), ephemeral: true });
    }

    value = value[interaction.options.getString(WAVE_ARG) as Wave];
    if (!value) {
      throw new Error(
        `Unknown combination: ${interaction.options.getSubcommand()} + ${value}`
      );
    }

    return interaction.reply({
      content: toContent(value as any),
      ephemeral: true,
    });
  },
};

function addSubcommands(builder: SlashCommandBuilder) {
  for (const [key, value] of Object.entries(groupedLinks)) {
    builder.addSubcommand((subcommand) => {
      const result = subcommand
        .setName(key)
        .setDescription(`TODO: explanation for ${key} command`);

      if (typeof value !== "string") {
        result.addStringOption((option) =>
          option
            .setName(WAVE_ARG)
            .setDescription("TODO: wave desc")
            .setRequired(true)
            .addChoices(
              ...Object.keys(value).map((key) => ({
                name: capitalizeFirstLetter(key),
                value: key,
              }))
            )
        );
      }

      return result;
    });
  }

  return builder;
}

function capitalizeFirstLetter(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function toContent(value: string | string[]) {
  if (typeof value === "string") return value;

  return value.join("\n");
}
