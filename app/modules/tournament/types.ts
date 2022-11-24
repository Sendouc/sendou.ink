import type { TournamentTeam } from "~/db/types";

export type TeamIdentifier = number | "BYE";

export interface Match {
  // xxx: needed? if not then remove uuid
  id: string;
  /** Match number as displayed on bracket. 0 if match should not show. */
  number: number;
  /** Match position that decides the order in which matches are displayed. No zeros. */
  position: number;
  upperTeam?: TeamIdentifier;
  lowerTeam?: TeamIdentifier;
  winner?: TeamIdentifier;
  loserDestinationMatch?: Match;
  winnerDestinationMatch?: Match;
  side: EliminationBracketSide;
}

export interface Bracket {
  winners: Match[];
  losers: Match[];
  participantCount: number;
  participantsWithByesCount: number;
}

export type EliminationBracket<T> = {
  winners: T;
  losers: T;
};

export type EliminationBracketSide = "winners" | "losers";

export type TournamentTeamWithMembers = TournamentTeam & { members: unknown[] };

export type BestOf = 3 | 5 | 7 | 9;

export interface TournamentRoundForDB {
  id: string;
  position: number;
  matches: {
    id: string;
    number: number;
    position: number;
    winnerDestinationMatchId?: string;
    loserDestinationMatchId?: string;
    participants: {
      team: { id: string } | "BYE";
      order: TeamOrder;
    }[];
  }[];
}
