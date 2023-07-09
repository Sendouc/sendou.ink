import type { Art, User, UserSubmittedImage } from "~/db/types";

export interface ListedArt {
  id: Art["id"];
  url: UserSubmittedImage["url"];
  description?: Art["description"];
  author?: {
    discordId: User["discordId"];
    discordName: User["discordName"];
    discordDiscriminator: User["discordDiscriminator"];
    discordAvatar: User["discordAvatar"];
    commissionsOpen?: User["commissionsOpen"];
  };
}

export const ART_SOURCES = ["ALL", "MADE-BY", "MADE-OF"] as const;
export type ArtSouce = (typeof ART_SOURCES)[number];
