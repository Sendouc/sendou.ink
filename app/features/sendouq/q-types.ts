import type {
  Group,
  GroupMember,
  ParsedMemento,
  PlusTier,
  User,
} from "~/db/types";
import type { MainWeaponId } from "~/modules/in-game-lists";
import type { TieredSkill } from "../mmr/tiered.server";
import type { GroupForMatch } from "./queries/groupForMatch.server";

export type LookingGroup = {
  id: number;
  mapListPreference?: Group["mapListPreference"];
  createdAt: Group["createdAt"];
  tier?: TieredSkill["tier"];
  isReplay?: boolean;
  isLiked?: boolean;
  team?: GroupForMatch["team"];
  chatCode: Group["chatCode"];
  skillDifference?: ParsedMemento["groups"][number]["skillDifference"];
  members?: {
    id: number;
    discordId: string;
    discordName: string;
    discordAvatar: string | null;
    customUrl?: User["customUrl"];
    plusTier?: PlusTier["tier"];
    role: GroupMember["role"];
    note?: GroupMember["note"];
    weapons?: MainWeaponId[];
    skill?: TieredSkill;
    vc?: User["vc"];
    inGameName?: User["inGameName"];
    languages?: string[];
    chatNameColor: string | null;
    skillDifference?: ParsedMemento["users"][number]["skillDifference"];
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
