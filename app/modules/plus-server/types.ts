import type { PlusVotingResult, User } from "~/db/types";

export interface MonthYear {
  month: number;
  year: number;
}

// xxx: rename -> same name as db type
export interface PlusVote {
  userId: User["id"];
  score: PlusVotingResult["score"];
}
