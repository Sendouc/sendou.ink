import { Skill } from "@prisma/client";
import { AMOUNT_OF_ENTRIES_REQUIRED_FOR_LEADERBOARD } from "~/constants";
import { muSigmaToSP } from "./utils";

export interface LeaderboardEntry {
  MMR: number;
  user: { id: string; discordName: string };
  entries: number;
}
type SkillInput = Pick<Skill, "mu" | "sigma" | "userId"> & {
  match: { createdAt: Date } | null;
  user: { id: string; discordName: string };
};
type UserId = string;

export function skillsToLeaderboard(skills: SkillInput[]): LeaderboardEntry[] {
  const counts: Record<UserId, number> = {};
  const peakMMR: Record<UserId, LeaderboardEntry> = {};

  for (const skill of skills.sort(sortSkillsByCreatedAt)) {
    if (!counts[skill.userId]) {
      counts[skill.userId] = 1;
    } else {
      counts[skill.userId]++;
    }

    if (counts[skill.userId] < AMOUNT_OF_ENTRIES_REQUIRED_FOR_LEADERBOARD) {
      continue;
    }

    const MMR = muSigmaToSP(skill);

    if (!peakMMR[skill.userId] || peakMMR[skill.userId].MMR < MMR) {
      peakMMR[skill.userId] = {
        MMR,
        user: {
          discordName: skill.user.discordName,
          id: skill.user.id,
        },
        // we set this below
        entries: 0,
      };
    }
  }

  for (const [userId, count] of Object.entries(counts)) {
    if (!peakMMR[userId]) continue;
    peakMMR[userId].entries = count;
  }

  return Object.values(peakMMR).sort((a, b) => b.MMR - a.MMR);
}

function sortSkillsByCreatedAt(a: SkillInput, b: SkillInput) {
  return (
    (a.match?.createdAt.getTime() ?? 0) - (b.match?.createdAt.getTime() ?? 0)
  );
}
