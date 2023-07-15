import type { Group, GroupMember } from "~/db/types";
import type { MainWeaponId } from "~/modules/in-game-lists";

export type LookingGroup = {
  id: number;
  mapListPreference: Group["mapListPreference"];
  isRanked: Group["isRanked"];
  members?: {
    id: number;
    discordId: string;
    discordName: string;
    discordAvatar: string;
    role: GroupMember["role"];
    weapons?: MainWeaponId[];
  }[];
};

export interface DividedGroups {
  own: LookingGroup;
  neutral: LookingGroup[];
  likesReceived: LookingGroup[];
  likesGiven: LookingGroup[];
}
