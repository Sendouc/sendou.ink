import type { Art, User, UserSubmittedImage } from "~/db/types";

export interface ListedArt {
  id: Art["id"];
  url: UserSubmittedImage["url"];
  description?: Art["description"];
  tags?: string[];
  linkedUsers?: Array<{
    discordId: User["discordId"];
    username: User["username"];
    discordDiscriminator: User["discordDiscriminator"];
    customUrl: User["customUrl"];
  }>;
  author?: {
    discordId: User["discordId"];
    username: User["username"];
    discordDiscriminator: User["discordDiscriminator"];
    discordAvatar: User["discordAvatar"];
    commissionsOpen?: User["commissionsOpen"];
  };
}

export const ART_SOURCES = ["ALL", "MADE-BY", "MADE-OF"] as const;
export type ArtSource = (typeof ART_SOURCES)[number];
