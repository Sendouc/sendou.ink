import fs from "node:fs";
import path from "node:path";
import z from "zod";
import { weapons } from "~/constants";
import type {
  LookingLoaderData,
  LookingLoaderDataGroup,
} from "~/routes/play/looking";

const infos = z
  .record(
    z.object({
      weapons: z.array(z.enum(weapons)).optional(),
      peakXP: z.number().optional(),
      peakLP: z.number().optional(),
    })
  )
  .parse(
    JSON.parse(
      fs
        .readFileSync(
          path.join(
            __dirname,
            "..",
            "..",
            "app",
            "core",
            "play",
            "playerInfos",
            "data.json"
          )
        )
        .toString()
    )
  );

export function addInfoFromOldSendouInk(
  type: "LEAGUE" | "SOLO",
  data: LookingLoaderData
): LookingLoaderData {
  return {
    ...data,
    ownGroup: mapGroup(data.ownGroup),
    likedGroups: data.likedGroups.map(mapGroup),
    neutralGroups: data.neutralGroups.map(mapGroup),
    likerGroups: data.likerGroups.map(mapGroup),
  };

  function mapGroup(group: LookingLoaderDataGroup): LookingLoaderDataGroup {
    return {
      ...group,
      members: group.members?.map((member) => {
        const playerInfos = infos[member.discordId];
        return {
          ...member,
          weapons: playerInfos?.weapons,
          peakXP: type === "SOLO" ? playerInfos?.peakXP : undefined,
          peakLP: type === "LEAGUE" ? playerInfos?.peakLP : undefined,
        };
      }),
    };
  }
}
