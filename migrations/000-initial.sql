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
  "country" text
) STRICT;

---
CREATE TABLE "PlusSuggestion" (
  "id" integer PRIMARY KEY,
  "text" text NOT NULL,
  "authorId" integer NOT NULL,
  "suggestedId" integer NOT NULL,
  "month" integer NOT NULL,
  "year" integer NOT NULL,
  "tier" integer NOT NULL,
  "createdAt" integer DEFAULT (strftime('%s', 'now')) NOT NULL,
  FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE,
  FOREIGN KEY ("suggestedId") REFERENCES "User"("id") ON DELETE CASCADE,
  UNIQUE(
    "month",
    "year",
    "suggestedId",
    "authorId",
    "tier"
  ) ON CONFLICT ROLLBACK
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
  "validAfter" integer NOT NULL,
  UNIQUE("month", "year", "authorId", "votedId") ON CONFLICT ROLLBACK
) STRICT;

CREATE INDEX plus_vote_author_id ON "PlusVote"("authorId");

CREATE INDEX plus_vote_voted_id ON "PlusVote"("votedId");

-- 1) Get the latest finished month/year
-- 2) Get votes that match this finished month/year then get vote average per user+tier
-- 3) Final result is userId + lowest tier with average of 50 or greater
CREATE VIEW "PlusTier" AS WITH "LastFinishedVotingMonthsAverages" AS (
  SELECT
    votedId,
    tier,
    AVG(score) AS average
  FROM
    PlusVote
  WHERE
    year = (
      SELECT
        year
      FROM
        PlusVote
      WHERE
        validAfter < strftime('%s', 'now')
      ORDER BY
        year desc,
        month desc
      LIMIT
        1
    )
    AND month = (
      SELECT
        month
      FROM
        PlusVote
      WHERE
        validAfter < strftime('%s', 'now')
      ORDER BY
        year desc,
        month desc
      LIMIT
        1
    )
  GROUP BY
    "votedId",
    tier
)
SELECT
  "votedId" AS "userId",
  min(tier) AS tier
FROM
  "LastFinishedVotingMonthsAverages"
WHERE
  average >= 0.5
GROUP BY
  "votedId";