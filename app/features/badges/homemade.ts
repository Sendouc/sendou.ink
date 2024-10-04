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
		fileName: "OriginalMessageDeleted",
		authorDiscordId: "751912670403362836",
	},
  	{
		displayName: "Shiny Wooper Achievement",
		fileName: "shinywooper",
		authorDiscordId: "528851510222782474",
	},
];
