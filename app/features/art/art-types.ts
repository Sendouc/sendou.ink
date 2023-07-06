import type { Art, User, UserSubmittedImage } from "~/db/types";

export interface ListedArt {
  id: Art["id"];
  url: UserSubmittedImage["url"];
  author: {
    discordId: User["discordId"];
    discordName: User["discordName"];
    discordDiscriminator: User["discordDiscriminator"];
    discordAvatar: User["discordAvatar"];
    commissionsOpen: User["commissionsOpen"];
  };
}
