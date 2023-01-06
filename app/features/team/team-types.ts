import type { MemberRole } from "~/db/types";
import type { MainWeaponId } from "~/modules/in-game-lists";

export interface DetailedTeam {
  id: number;
  customUrl: string;
  name: string;
  bio?: string;
  twitter?: string;
  avatarSrc?: string;
  bannerSrc?: string;
  countries: string[];
  members: DetailedTeamMember[];
  results?: TeamResultPeek;
}

export interface DetailedTeamMember {
  id: number;
  discordName: string;
  discordId: string;
  discordAvatar: string | null;
  isOwner: boolean;
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
