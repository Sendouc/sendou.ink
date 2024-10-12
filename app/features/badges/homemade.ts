interface BadgeInfo {
	// The name of the badge as it shows on the web page: "Awarded for winning {displayName}"
	displayName: string;
	// The file name of the badge: fileName.png, fileName.avif & fileName.gif
	fileName: string;
	// The Discord ID of the person who made the badge (not the person who commissioned it)
	authorDiscordId: string;
}

export const homemadeBadges: BadgeInfo[] = [
	// EXAMPLE
	// {
	// 	displayName: "Example Badge",
	// 	fileName: "example",
	// 	authorDiscordId: "123456789012345678",
	// },
	{
		displayName: "Break Zach's Bank",
		fileName: "breakzachsbank",
		authorDiscordId: "528851510222782474",
	},
	{
		displayName: "Tristrike Tuesday",
		fileName: "tristriketuesday",
		authorDiscordId: "789943264370884708",
	},
	{
		displayName: "VERSUS THE WORLD",
		fileName: "cookie",
		authorDiscordId: "528851510222782474",
	},
	{
		displayName: "Not Enough Liter",
		fileName: "custom_e-liter",
		authorDiscordId: "352207524390240257",
	},
	{
		displayName: "Blast Away!",
		fileName: "lunablaster",
		authorDiscordId: "342369454719631361",
	},
	{
		displayName: "Original Message Deleted",
		fileName: "original-message-deleted",
		authorDiscordId: "751912670403362836",
	},
	{
		displayName: "Shiny Wooper Achievement",
		fileName: "shinywooper",
		authorDiscordId: "528851510222782474",
	},
	{
		displayName: "OCE Open",
		fileName: "ausflag",
		authorDiscordId: "1170249805373657093",
	},
	{
		displayName: "TableTurf: RISE",
		fileName: "tableturf-rise",
		authorDiscordId: "528851510222782474",
	},
	{
		displayName: "A Special Tournament",
		fileName: "chara_special",
		authorDiscordId: "1081428018666422313",
	},
	{
		displayName: "Dolphin Showdown",
		fileName: "dolphin",
		authorDiscordId: "528851510222782474",
	},
	{
		displayName: "Raid Weekend",
		fileName: "raid-weekend",
		authorDiscordId: "354880982890971136",
	},
	{
		displayName: "It's Dangerous To Go Alone Master Bracket",
		fileName: "idtgamb",
		authorDiscordId: "354880982890971136",
	},
	{
		displayName: "Lone Sailor",
		fileName: "lone_sailor",
		authorDiscordId: "354880982890971136",
	},
	{
		displayName: "Junior's Draft",
		fileName: "jrs_draft",
		authorDiscordId: "118724226994667523",
	},
	{
		displayName: "Paraflinch",
		fileName: "paraflinch",
		authorDiscordId: "528851510222782474",
	},
	{
		displayName: "GHOST TYPE RUSH",
		fileName: "gengar",
		authorDiscordId: "528851510222782474",
	},
	{
		displayName: "GHOST TYPE RUSH SHINY EDITION",
		fileName: "gengarshiny",
		authorDiscordId: "528851510222782474",
	},
	{
		displayName: "DAYTONA Speedweeks '25",
		fileName: "daytonaspeedweeks1st",
		authorDiscordId: "528851510222782474",
	},
	{
		displayName: "DAYTONA Speedweeks '25 (2nd place)",
		fileName: "daytonaspeedweeks2nd",
		authorDiscordId: "528851510222782474",
	},
	{
		displayName: "Shark Tank (Gold)",
		fileName: "sharktank1st",
		authorDiscordId: "528851510222782474",
	},
	{
		displayName: "Shark Tank (Silver)",
		fileName: "sharktank2nd",
		authorDiscordId: "528851510222782474",
	},
	{
		displayName: "Shark Tank (Bronze)",
		fileName: "sharktank3rd",
		authorDiscordId: "528851510222782474",
	},
];
