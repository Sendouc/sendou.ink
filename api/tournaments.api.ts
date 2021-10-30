type Mode = "TW" | "SZ" | "TC" | "RM" | "CB";

export interface GetTournamentByOrganizationAndName {
  name: string;
  description: string | null;
  startTime: Date;
  checkInTime: Date;
  bannerBackground: string;
  bannerTextHSLArgs: string;
  organizer: {
    name: string;
    discordInvite: string;
    twitter: string | null;
    nameForUrl: string;
  };
  mapPool: {
    name: string;
    mode: Mode;
  }[];
}
