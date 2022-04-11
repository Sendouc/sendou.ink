import { Skill } from "@prisma/client";
import { AMOUNT_OF_ENTRIES_REQUIRED_FOR_LEADERBOARD } from "~/constants";
import { muSigmaToSP } from "./utils";

export interface LeaderboardEntry {
  MMR: number;
  user: { id: string; discordName: string };
  entries: number;
}
type SkillInput = Pick<
  Skill,
  "mu" | "sigma" | "userId" | "amountOfSets" | "createdAt"
> & {
  user: { id: string; discordName: string };
};
type UserId = string;

export function skillsToLeaderboard(skills: SkillInput[]): LeaderboardEntry[] {
  const counts: Record<UserId, number> = {};
  const peakMMR: Record<UserId, LeaderboardEntry> = {};

  for (const skill of skills.sort(sortSkillsByCreatedAt)) {
    if (!counts[skill.userId]) {
      counts[skill.userId] = skill.amountOfSets ?? 1;
    } else {
      counts[skill.userId] = counts[skill.userId] + (skill.amountOfSets ?? 1);
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
  return a.createdAt.getTime() - b.createdAt.getTime();
}

export function monthYearOptions() {
  const FIRST_MONTH = 3;
  const FIRST_YEAR = 2022;

  const result: { month: number; year: number }[] = [];
  let month = new Date().getMonth() + 1;
  let year = new Date().getFullYear();

  do {
    result.push({ month, year });

    month--;
    if (month === 0) {
      month = 12;
      year--;
    }
  } while (month >= FIRST_MONTH && year >= FIRST_YEAR);

  return result;
}

export function monthYearIsValid({
  month,
  year,
}: {
  month: number;
  year: number;
}) {
  return monthYearOptions().some(
    (option) => option.month === month && option.year === year
  );
}
