import type { Group, GroupMember } from "~/db/types";
import type { MainWeaponId } from "~/modules/in-game-lists";

export type LookingGroup = {
  id: number;
  mapListPreference: Group["mapListPreference"];
  members?: {
    id: number;
    discordId: string;
    discordName: string;
    discordAvatar: string;
    role: GroupMember["role"];
    weapons?: MainWeaponId[];
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
