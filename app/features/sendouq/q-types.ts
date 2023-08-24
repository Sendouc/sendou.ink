import type { Group, GroupMember, PlusTier, User } from "~/db/types";
import type { MainWeaponId } from "~/modules/in-game-lists";
import type { TieredSkill } from "../mmr/tiered.server";

export type LookingGroup = {
  id: number;
  mapListPreference?: Group["mapListPreference"];
  tier?: TieredSkill["tier"];
  isReplay?: boolean;
  members?: {
    id: number;
    discordId: string;
    discordName: string;
    discordAvatar: string;
    plusTier?: PlusTier["tier"];
    role: GroupMember["role"];
    weapons?: MainWeaponId[];
    skill?: TieredSkill;
    vc: User["vc"];
    languages: string[];
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
  likesGiven: LookingGroup[];
}

export interface DividedGroupsUncensored {
  own: LookingGroupWithInviteCode;
  neutral: LookingGroupWithInviteCode[];
  likesReceived: LookingGroupWithInviteCode[];
  likesGiven: LookingGroupWithInviteCode[];
}
