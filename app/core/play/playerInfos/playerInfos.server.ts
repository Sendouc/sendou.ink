import type {
  LookingLoaderData,
  LookingLoaderDataGroup,
} from "~/routes/play/looking";
import rawInfos from "./data.json";

const infos = rawInfos as Partial<
  Record<string, { weapons?: string[]; peakXP?: number; peakLP?: number }>
>;
const idsWithResults = new Set(Object.keys(infos));

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
          peakXP: type === "SOLO" ? playerInfos?.peakXP : undefined,
          peakLP: type === "LEAGUE" ? playerInfos?.peakLP : undefined,
        };
      }),
    };
  }
}

export function playersWithResults(discordIds: string[]): string[] {
  return discordIds.filter((id) => idsWithResults.has(id));
}

export function userHasTop500Result({ discordId }: { discordId?: string }) {
  if (!discordId) return false;
  return Boolean(infos[discordId]?.peakXP);
}
