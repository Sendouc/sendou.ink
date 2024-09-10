export const TEAM = {
	NAME_MAX_LENGTH: 64,
	NAME_MIN_LENGTH: 2,
	BIO_MAX_LENGTH: 2000,
	TWITTER_MAX_LENGTH: 50,
	MAX_MEMBER_COUNT: 8,
	MAX_TEAM_COUNT_NON_PATRON: 2,
	MAX_TEAM_COUNT_PATRON: 5,
};

export const TEAM_MEMBER_ROLES = [
	"CAPTAIN",
	"CO_CAPTAIN",
	"FRONTLINE",
	"SKIRMISHER",
	"SUPPORT",
	"MIDLINE",
	"BACKLINE",
	"FLEX",
	"SUB",
	"COACH",
	"CHEERLEADER",
] as const;

export const TEAMS_PER_PAGE = 40;
