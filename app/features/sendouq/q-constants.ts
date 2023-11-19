import { TWEET_LENGTH_MAX_LENGTH } from "~/constants";

export const SENDOUQ = {
  SZ_MAP_COUNT: 6,
  OTHER_MODE_MAP_COUNT: 3,
  MAX_STAGE_REPEAT_COUNT: 2,
  NOTE_MAX_LENGTH: TWEET_LENGTH_MAX_LENGTH / 2,
} as const;

export const FULL_GROUP_SIZE = 4;

export const SENDOUQ_BEST_OF = 7;

export const JOIN_CODE_SEARCH_PARAM_KEY = "join";

export const USER_SKILLS_CACHE_KEY = "user-skills";
