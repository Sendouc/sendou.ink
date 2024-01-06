import { sql } from "kysely";

export const COMMON_USER_FIELDS = [
  "User.id",
  "User.discordName",
  "User.discordId",
  "User.discordAvatar",
  "User.customUrl",
] as const;

export const userChatNameColor = sql<
  string | null
>`IIF(COALESCE("User"."patronTier", 0) >= 2, "User"."css" ->> 'chat', null)`.as(
  "chatNameColor",
);
