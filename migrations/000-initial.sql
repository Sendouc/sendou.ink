CREATE TABLE "User" (
  "id" integer PRIMARY KEY,
  "discordId" text UNIQUE NOT NULL,
  "discordName" text NOT NULL,
  "discordDiscriminator" text NOT NULL,
  "discordAvatar" text,
  "twitch" text,
  "twitter" text,
  "youtubeId" text,
  "youtubeName" text,
  "bio" text,
  "country" text
) STRICT;