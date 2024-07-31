export type Bracket =
	| SingleEliminationBracket
	| DoubleEliminationBracket
	| RoundRobinBracket
	| SwissBracket;

interface BaseBracket {
	name: string;
	preview: boolean;
}

export interface SingleEliminationBracket extends BaseBracket {
	type: "single_elimination";
	rounds: BracketRound[];
}

interface DoubleEliminationBracket extends BaseBracket {
	type: "double_elimination";
	winners: BracketRound[];
	losers: BracketRound[];
}

interface RoundRobinBracket extends BaseBracket {
	type: "round_robin";
	rounds: BracketRound[];
}

interface SwissBracket extends BaseBracket {
	type: "swiss";
	rounds: BracketRound[];
}

// xxx: RR & Swiss with letter & standings etc.

export interface BracketRound {
	id: number;
	number: number;
	matches: BracketMatch[];
	deadline?: string;
	name?: "GRAND_FINALS" | "BRACKET_RESET" | "FINALS" | "SEMIS" | "THIRD_PLACE";
	maps?: {
		count: number;
		type: "PLAY_ALL" | "BEST_OF";
		pickBan?: "COUNTERPICK" | "BAN_2";
	};
}

export interface BracketMatch {
	id: number;
	participants: [number | null, number | null];
	number: number;
	predictions?: [number, number];
	winner?: number;
	score?: [number, number];
	bye: boolean;
	stream?: "LIVE" | "TO_BE_CASTED";
}

export interface BracketMatchParticipant {
	id: number;
	name: string;
	seed: number;
	roster: string[];
	avatarUrl?: string;
}

export interface BracketMatchWithParticipantInfo
	extends Omit<BracketMatch, "participants" | "predictions"> {
	participants: [
		BracketMatchParticipant | null,
		BracketMatchParticipant | null,
	];
	predictions?: [BracketMatchParticipant, BracketMatchParticipant];
}
