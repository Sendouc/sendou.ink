import type { MemberRole } from "~/db/types";
import type { MainWeaponId } from "~/modules/in-game-lists";

export interface DetailedTeam {
  name: string;
  bio?: string;
  twitter?: string;
  lutiDiv?: string;
  avatarSrc?: string;
  bannerSrc?: string;
  teamXp?: string;
  countries: string[];
  members: DetailedTeamMember[];
  results?: TeamResultPeek;
}

export interface DetailedTeamMember {
  discordName: string;
  discordId: string;
  discordAvatar: string | null;
  weapons: MainWeaponId[];
  role?: MemberRole;
}

export interface TeamResultPeek {
  count: number;
  placements: Array<TeamResultPeekPlacement>;
}

export interface TeamResultPeekPlacement {
  placement: number;
  count: number;
}
