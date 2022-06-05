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
  FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE,
  FOREIGN KEY ("votedId") REFERENCES "User"("id") ON DELETE CASCADE,
  UNIQUE("month", "year", "authorId", "votedId") ON CONFLICT ROLLBACK
) STRICT;

CREATE INDEX plus_vote_author_id ON "PlusVote"("authorId");

CREATE INDEX plus_vote_voted_id ON "PlusVote"("votedId");

-- TODO: maybe tests for this?
CREATE VIEW "PlusVotingResult" AS
SELECT
  "votedId",
  tier,
  AVG(score) AS score,
  AVG(score) >= 0 as "passedVoting",
  month,
  year,
  EXISTS (
    SELECT
      1
    FROM
      "PlusSuggestion"
    WHERE
      "PlusSuggestion"."month" = "PlusVote"."month"
      AND "PlusSuggestion"."year" = "PlusVote"."year"
      AND "PlusSuggestion"."suggestedId" = "PlusVote"."votedId"
      AND "PlusSuggestion"."tier" = "PlusVote"."tier"
  ) as "wasSuggested"
FROM
  "PlusVote"
GROUP BY
  "votedId",
  tier,
  month,
  year;

CREATE VIEW "PlusTier" AS
SELECT
  "votedId" AS "userId",
  case
    when "passedVoting" = 0
    AND "wasSuggested" = 1 then NULL
    when "passedVoting" = 1 then tier
    when "passedVoting" = 0
    AND tier != 3 then tier + 1
  end tier
FROM
  "PlusVotingResult"
WHERE
  year = (
    SELECT
      year
    FROM
      "PlusVote"
    WHERE
      "validAfter" < strftime('%s', 'now')
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
      "PlusVote"
    WHERE
      "validAfter" < strftime('%s', 'now')
    ORDER BY
      year desc,
      month desc
    LIMIT
      1
  )
GROUP BY
  "votedId";

-- if suggested or +3 then no change from current behavior
-- if not suggested and average < 0.5 then tier = voted tier - 1
-- so in fact we need one more table in addition to PlusTier - PlusVotingResult (contains LastFinishedVotingMonthsAverages + wasSuggested)