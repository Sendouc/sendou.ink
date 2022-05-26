CREATE TABLE "User" (
  "id" integer PRIMARY KEY,
  "discordId" text UNIQUE NOT NULL,
  "discordName" text NOT NULL,
  "discordDiscriminator" text NOT NULL,
  "discordAvatar" text,
  "twitch" text,
  "twitter" text,
  "youtubeId" text,
  "bio" text,
  "country" text,
  "plusTier" integer
) STRICT;

---
CREATE TABLE "PlusSuggestion" (
  "text" text NOT NULL,
  "authorId" integer NOT NULL,
  "suggestedId" integer NOT NULL,
  "month" integer NOT NULL,
  "year" integer NOT NULL,
  "tier" integer NOT NULL,
  "createdAt" integer DEFAULT (strftime('%s', 'now')) NOT NULL,
  FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE,
  FOREIGN KEY ("suggestedId") REFERENCES "User"("id") ON DELETE CASCADE,
  UNIQUE("month", "year", "suggestedId", "authorId", "tier") ON CONFLICT ROLLBACK
) STRICT;

CREATE INDEX plus_suggestion_author_id ON "PlusSuggestion"("authorId");

CREATE INDEX plus_suggestion_suggested_id ON "PlusSuggestion"("suggestedId");

---
CREATE TABLE "PlusVote" (
  "month" integer NOT NULL,
  "year" integer NOT NULL,
  "tier" integer NOT NULL,
  "authorId" integer NOT NULL,
  "votedId" integer NOT NULL,
  "score" integer NOT NULL,
  UNIQUE("month", "year", "authorId", "votedId") ON CONFLICT ROLLBACK
) STRICT;

CREATE INDEX plus_vote_author_id ON "PlusVote"("authorId");

CREATE INDEX plus_vote_voted_id ON "PlusVote"("votedId");