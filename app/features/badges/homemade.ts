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
		displayName: "Vaporeon Eeveelution",
		fileName: "vaporeon",
		authorDiscordId: "313762200286396416",
	}
];
