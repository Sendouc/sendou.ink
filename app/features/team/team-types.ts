import type { MemberRole, UserWeapon } from "~/db/types";

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
  username: string;
  discordId: string;
  discordAvatar: string | null;
  discordDiscriminator: string;
  isOwner: boolean;
  weapons: Array<Pick<UserWeapon, "weaponSplId" | "isFavorite">>;
  role?: MemberRole;
  patronTier: number | null;
}

export interface TeamResultPeek {
  count: number;
  placements: Array<TeamResultPeekPlacement>;
}

export interface TeamResultPeekPlacement {
  placement: number;
  count: number;
}
