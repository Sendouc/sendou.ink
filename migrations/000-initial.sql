CREATE TABLE "users" (
  "id" integer PRIMARY KEY,
  "discord_id" text UNIQUE NOT NULL,
  "discord_name" text NOT NULL,
  "discord_discriminator" text NOT NULL,
  "discord_avatar" text,
  "twitch" text,
  "twitter" text,
  "youtube_id" text,
  "youtube_name" text,
  "bio" text,
  "country" text
) STRICT;