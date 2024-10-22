// todo

import type { Tables, TournamentStageSettings } from "~/db/tables";

export interface DBSource {
	/** Index of the bracket where the teams come from */
	bracketIdx: number;
	/** Team placements that join this bracket. E.g. [1, 2] would mean top 1 & 2 teams. [-1] would mean the last placing teams. */
	placements: number[];
}

export interface EditableSource {
	/** Bracket ID that exists in frontend only while editing. Once the sources are set an index is used to identifyer them instead. See DBSource.bracketIdx for more info. */
	bracketId: string;
	/** User editable string of placements. For example might be "1-3" or "1,2,3" which both mean same thing. See DBSource.placements for the validated and serialized version. */
	placements: string;
}

interface BracketBase {
	type: Tables["TournamentStage"]["type"];
	settings: TournamentStageSettings;
	name: string;
}

// Note sources is array for future proofing reasons. Currently the array is always of length 1 if it exists.

interface InputBracket extends BracketBase {
	sources?: EditableSource[];
}

interface ValidatedBracket {
	sources?: DBSource[];
}

export type ValidationError =
	// user written placements can not be parsed
	| {
			type: "PLACEMENTS_PARSE_ERROR";
			bracketIds: string[];
	  }
	// tournament is ending with a format that does not resolve a winner such as round robin or grouped swiss
	| {
			type: "NOT_RESOLVING_WINNER";
	  }
	// from each bracket one placement can lead to only one bracket
	| {
			type: "SAME_PLACEMENT_TO_TWO_BRACKETS";
	  }
	// from one bracket e.g. if 1st goes somewhere and 3rd goes somewhere then 2nd must also go somewhere
	| {
			type: "GAP_IN_PLACEMENTS";
	  }
	// if round robin groups size is 4 then it doesn't make sense to have destination for 5
	| {
			type: "TOO_MANY_PLACEMENTS";
	  }
	// two brackets can not have the same name
	| {
			type: "DUPLICATE_BRACKET_NAME";
	  }
	// all brackets must have a name that is not an empty string
	| {
			type: "NAME_MISSING";
	  }
	// bracket cannot be both source and destination at the same time
	| {
			type: "CIRCULAR_PROGRESSION";
	  }
	// negative progression (e.g. losers of first round go somewhere) is only for elimination bracket
	| {
			type: "NEGATIVE_PROGRESSION";
	  };

export function validatedSources(
	brackets: InputBracket[],
): ValidatedBracket[] | ValidationError {
	return [];
}
