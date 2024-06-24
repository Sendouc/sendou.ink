export const TOURNAMENT = {
	TEAM_NAME_MAX_LENGTH: 32,
	COUNTERPICK_MAPS_PER_MODE: 2,
	COUNTERPICK_MAX_STAGE_REPEAT: 2,
	COUNTERPICK_ONE_MODE_TOURNAMENT_MAPS_PER_MODE: 6,
	AVAILABLE_BEST_OF: [3, 5, 7] as const,
	ENOUGH_TEAMS_TO_START: 2,
	MIN_GROUP_SIZE: 3,
	MAX_GROUP_SIZE: 6,
} as const;

export const BRACKET_NAMES = {
	UNDERGROUND: "Underground bracket",
	MAIN: "Main bracket",
	GROUPS: "Group stage",
	FINALS: "Final stage",
};

export const FORMATS_SHORT = [
	"DE",
	"SE",
	"RR_TO_SE",
	"SWISS",
	"SWISS_TO_SE",
] as const;
export type TournamentFormatShort = (typeof FORMATS_SHORT)[number];
