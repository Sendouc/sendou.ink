import type { Group, GroupMember, PlusTier, User } from "~/db/types";
import type { MainWeaponId } from "~/modules/in-game-lists";
import type { TieredSkill } from "../mmr/tiered.server";

export type LookingGroup = {
  id: number;
  mapListPreference?: Group["mapListPreference"];
  tier?: TieredSkill["tier"];
  isReplay?: boolean;
  isLiked?: boolean;
  members?: {
    id: number;
    discordId: string;
    discordName: string;
    discordAvatar: string | null;
    customUrl?: User["customUrl"];
    plusTier?: PlusTier["tier"];
    role: GroupMember["role"];
    weapons?: MainWeaponId[];
    skill?: TieredSkill;
    vc?: User["vc"];
    languages?: string[];
    chatNameColor: string | null;
  }[];
};

export type LookingGroupWithInviteCode = LookingGroup & {
  inviteCode: Group["inviteCode"];
  members: NonNullable<LookingGroup["members"]>;
};

export interface DividedGroups {
  own: LookingGroup | LookingGroupWithInviteCode;
  neutral: LookingGroup[];
  likesReceived: LookingGroup[];
}

export interface DividedGroupsUncensored {
  own: LookingGroupWithInviteCode;
  neutral: LookingGroupWithInviteCode[];
  likesReceived: LookingGroupWithInviteCode[];
}
