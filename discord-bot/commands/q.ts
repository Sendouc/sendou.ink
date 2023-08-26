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
      .setDescription("Find a link"),
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
        `Unknown combination: ${interaction.options.getSubcommand()} + ${value}`,
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
        .setDescription(keyToDescription(key));

      if (typeof value !== "string") {
        result.addStringOption((option) =>
          option
            .setName(WAVE_ARG)
            .setDescription("Type of map")
            .setRequired(true)
            .addChoices(
              ...Object.keys(value).map((key) => ({
                name: key,
                value: key,
              })),
            ),
        );
      }

      return result;
    });
  }

  return builder;
}

function toContent(value: string | string[]) {
  if (typeof value === "string") return value;

  return value.join("\n");
}

function keyToDescription(key: string) {
  const descriptions = new Map([
    ["sg", "Spawning Grounds maps"],
    ["mb", "Marooner's Bay maps"],
    ["lo", "Lost Outpost maps"],
    ["ss", "Salmonid Smokeyard maps"],
    ["ap", "Ruins of Ark Polaris maps"],
    [
      "fundamentals",
      "Written guide going over all the Overfishing fundamentals",
    ],
    [
      "fundamentals2",
      "Live video that goes into some Overfishing fundamentals",
    ],
    ["advanced", "Written guide going over advanced Overfishing strategies"],
    ["spawns", "Table showing spawn timers"],

    ["ballpoint", "Video guide explaining the basics of Ballpoint in SR"],
    ["explo", "Video guide explaining the basics of Explosher in SR"],
    ["dynamo", "Video guide explaining the basics of Dynamo in SR"],
    ["bamboo", "Video guide explaining the basics of Bamboo in SR"],
    ["hydra", "Video guide explaining the basics of Hydra in SR"],
  ]);

  const result = descriptions.get(key);
  if (!result) throw new Error(`Unknown subcommand: ${key}`);

  return result;
}
