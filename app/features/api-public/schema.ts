import type { DataTypes, ValueToArray } from "~/modules/brackets-manager/types";

/** GET /api/user/{userId|discordId} */

export interface GetUserResponse {
  id: number;
  /**
   * @example "Sendou"
   */
  name: string;
  /**
   * @example "79237403620945920"
   */
  discordId: string;
  /**
   * @example "https://sendou.ink/u/sendou"
   */
  url: string;
  /**
   * @example "https://cdn.discordapp.com/avatars/79237403620945920/6fc41a44b069a0d2152ac06d1e496c6c.png"
   */
  avatarUrl: string | null;
  /**
   * @example "FI"
   */
  country: string | null;
  socials: {
    twitch: string | null;
    twitter: string | null;
  };
  plusServerTier: 1 | 2 | 3 | null;
  weaponPool: Array<ProfileWeapon>;
  badges: Array<Badge>;
  peakXp: number | null;
  // TODO: can be added to this endpoint / another one if use case arises
  // leaderboardEntry: {
  //   season: number;
  //   position: number;
  //   power: number;
  //   tier: Tier;
  //   weapon: Weapon | null;
  // } | null;
}

/** GET /api/tournament/{tournamentId} */

export interface GetTournamentResponse {
  /**
   * @example "In The Zone 30"
   */
  name: string;
  /**
   * @example "https://sendou.ink/to/9/brackets"
   */
  url: string;
  /**
   * @example "https://sendou.ink/static-assets/img/tournament-logos/itz.png"
   */
  logoUrl: string | null;
  /**
   * @example "2024-01-12T20:00:00.000Z"
   */
  startTime: string;
  teams: {
    registeredCount: number;
    checkedInCount: number;
  };
  brackets: TournamentBracket[];
}

/** GET /api/tournament/{tournamentId}/teams */

export type GetTournamentTeamsResponse = Array<{
  id: number;
  /**
   * @example "Team Olive"
   */
  name: string;
  /**
   * @example "2024-01-12T20:00:00.000Z"
   */
  registeredAt: string;
  checkedIn: boolean;
  /**
   * URL for the tournament team page.
   *
   * @example "https://sendou.ink/to/9/teams/327"
   */
  url: string;
  /**
   * URL for the global team page.
   *
   * @example "https://sendou.ink/t/moonlight"
   */
  teamPageUrl: string | null;
  /**
   * @example "https://sendou.nyc3.cdn.digitaloceanspaces.com/pickup-logo-uReSb1b1XS3TWGLCKMDUD-1719054364813.webp"
   */
  logoUrl: string | null;
  seed: number | null;
  mapPool: Array<StageWithMode> | null;
  members: Array<{
    userId: number;
    /**
     * @example "Sendou"
     */
    name: string;
    /**
     * @example "79237403620945920"
     */
    discordId: string;
    /**
     * @example "https://cdn.discordapp.com/avatars/79237403620945920/6fc41a44b069a0d2152ac06d1e496c6c.png"
     */
    avatarUrl: string | null;
    captain: boolean;
    /**
     * @example "2024-01-12T20:00:00.000Z"
     */
    joinedAt: string;
  }>;
}>;

/** GET /api/tournament-match/{matchId} */

export interface GetTournamentMatchResponse {
  teamOne: TournamentMatchTeam | null;
  teamTwo: TournamentMatchTeam | null;
  mapList: Array<MapListMap> | null;
  /**
   * @example "https://sendou.ink/to/9/matches/695"
   */
  url: string;
}

/** GET /api/tournament/{tournamentId}/brackets/{bracketIndex} */

export interface GetTournamentBracketResponse {
  data: TournamentBracketData;
  meta: {
    /** How many teams per group? (round robin only) */
    teamsPerGroup?: number;
    /** How many groups? (swiss only) */
    groupCount?: number;
    /** How many rounds? (swiss only) */
    roundCount?: number;
  };
}

/* ----------------------------------------- */

type Weapon = {
  id: number;
  name: string;
};

type ProfileWeapon = Weapon & { isFiveStar: boolean };

type Badge = {
  /**
   * @example "Monday Afterparty"
   */
  name: string;
  count: number;
  /**
   * @example "https://sendou.ink/static-assets/badges/monday.png"
   */
  imageUrl: string;
  /**
   * @example "https://sendou.ink/static-assets/badges/monday.gif"
   */
  gifUrl: string;
};

// type Tier =
//   | "LEVIATHAN+"
//   | "DIAMOND+"
//   | "PLATINUM+"
//   | "GOLD+"
//   | "SILVER+"
//   | "BRONZE+"
//   | "IRON+"
//   | "LEVIATHAN"
//   | "DIAMOND"
//   | "PLATINUM"
//   | "GOLD"
//   | "SILVER"
//   | "BRONZE"
//   | "IRON";

type ModeShort = "TW" | "SZ" | "TC" | "RM" | "CB";
type Stage = {
  id: number;
  name: string;
};

type StageWithMode = {
  mode: ModeShort;
  stage: Stage;
};

type MapListMap = {
  map: StageWithMode;
  /**
   * One of the following:
   * - id of the team that picked the map
   * - "DEFAULT" if it was a default map, something went wrong with the algorithm typically
   * - "TIEBREAKER" if it was a tiebreaker map (selected by the TO)
   * - "BOTH" both teams picked the map
   * - "TO" if it was a TO pick (from predefined maplist)
   * - "COUNTERPICK" if it was a counterpick
   */
  source: number | "DEFAULT" | "TIEBREAKER" | "BOTH" | "TO" | "COUNTERPICK";
  winnerTeamId: number | null;
  participatedUserIds: Array<number> | null;
};

type TournamentMatchTeam = {
  id: number;
  score: number;
};

type TournamentBracket = {
  type: "double_elimination" | "single_elimination" | "round_robin" | "swiss";
  name: string;
};

// TODO: use a better documented type here
type TournamentBracketData = ValueToArray<DataTypes>;
