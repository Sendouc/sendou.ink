import allTags from "~/routes/calendar/tags.json";
import type { CalendarEventTag } from "./db/types";
import type { BuildAbilitiesTupleWithUnknown } from "./modules/in-game-lists";

export const TWEET_LENGTH_MAX_LENGTH = 280;
export const DISCORD_MESSAGE_MAX_LENGTH = 2000;

export const USER = {
  BIO_MAX_LENGTH: DISCORD_MESSAGE_MAX_LENGTH,
  CUSTOM_URL_MAX_LENGTH: 32,
  IN_GAME_NAME_TEXT_MAX_LENGTH: 20,
  IN_GAME_NAME_DISCRIMINATOR_MAX_LENGTH: 5,
  WEAPON_POOL_MAX_SIZE: 5,
  COMMISSION_TEXT_MAX_LENGTH: 1000,
};

export const PlUS_SUGGESTION_FIRST_COMMENT_MAX_LENGTH = 500;
export const PlUS_SUGGESTION_COMMENT_MAX_LENGTH = TWEET_LENGTH_MAX_LENGTH;

export const CALENDAR_EVENT = {
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: DISCORD_MESSAGE_MAX_LENGTH,
  DISCORD_INVITE_CODE_MAX_LENGTH: 50,
  BRACKET_URL_MAX_LENGTH: 200,
  MAX_AMOUNT_OF_DATES: 5,
  TAGS: Object.keys(allTags) as Array<CalendarEventTag>,
};

export const CALENDAR_EVENT_RESULT = {
  MAX_PARTICIPANTS_COUNT: 1000,
  MAX_PLAYERS_LENGTH: 8,
  MAX_TEAM_NAME_LENGTH: 100,
  MAX_TEAM_PLACEMENT: 256,
  MAX_PLAYER_NAME_LENGTH: 100,
} as const;

export const BUILD = {
  TITLE_MIN_LENGTH: 1,
  TITLE_MAX_LENGTH: 50,
  DESCRIPTION_MAX_LENGTH: TWEET_LENGTH_MAX_LENGTH,
  MAX_WEAPONS_COUNT: 5,
  MAX_COUNT: 250,
} as const;

export const MAPS = {
  CODE_MIN_LENGTH: 2,
  CODE_MAX_LENGTH: 32,
};

export const BUILDS_PAGE_BATCH_SIZE = 24;
export const BUILDS_PAGE_MAX_BUILDS = 240;

export const INVITE_CODE_LENGTH = 10;

export const EMPTY_BUILD: BuildAbilitiesTupleWithUnknown = [
  ["UNKNOWN", "UNKNOWN", "UNKNOWN", "UNKNOWN"],
  ["UNKNOWN", "UNKNOWN", "UNKNOWN", "UNKNOWN"],
  ["UNKNOWN", "UNKNOWN", "UNKNOWN", "UNKNOWN"],
];

export const PLUS_TIERS = [1, 2, 3];

export const PLUS_UPVOTE = 1;
export const PLUS_DOWNVOTE = -1;

export const ADMIN_DISCORD_ID = "79237403620945920";
export const ADMIN_ID = process.env.NODE_ENV === "production" ? 274 : 1;

//                      Panda
export const MOD_IDS = [11329];

export const LOHI_TOKEN_HEADER_NAME = "Lohi-Token";
export const SKALOP_TOKEN_HEADER_NAME = "Skalop-Token";

export const CUSTOMIZED_CSS_VARS_NAME = "css";

export const MAX_AP = 57;

export const HALF_HOUR_IN_MS = 30 * 60 * 1000;
export const ONE_HOUR_IN_MS = 60 * 60 * 1000;

export const SPLATOON_3_XP_BADGE_VALUES = [
  3400, 3300, 3200, 3100, 3000, 2900, 2800, 2700, 2600,
] as const;
export const findSplatoon3XpBadgeValue = (xPower: number) => {
  for (const value of SPLATOON_3_XP_BADGE_VALUES) {
    if (xPower >= value) {
      return value;
    }
  }

  return null;
};
