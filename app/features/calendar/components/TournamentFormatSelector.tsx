import * as React from "react";
import { DateInput } from "~/components/DateInput";
import { FormMessage } from "~/components/FormMessage";
import { Input } from "~/components/Input";
import { Label } from "~/components/Label";
import { Toggle } from "~/components/Toggle";
import type {
	Tables,
	TournamentBracketProgression,
	TournamentStageSettings,
} from "~/db/tables";

// xxx: id?
export interface TournamentFormatBracket {
	name: string;
	type: Tables["TournamentStage"]["type"];
	requiresCheckIn: boolean | null;
	startTime: number | null;
	settings: TournamentStageSettings;
	sources: NonNullable<TournamentBracketProgression> | null;
}

interface TournamentFormatSelectorProps {
	brackets: TournamentFormatBracket[];
	onChange: (bracket: TournamentFormatBracket[]) => void;
}

export function TournamentFormatSelector({
	brackets,
	onChange,
}: TournamentFormatSelectorProps) {
	return (
		<div className="stack sm">
			{brackets.map((bracket, i) => (
				<TournamentFormatBracketSelector
					key={bracket.name}
					bracket={bracket}
					onChange={(newBracket) => {
						const newBrackets = [...brackets];
						newBrackets[i] = newBracket;
						onChange(newBrackets);
					}}
					count={i + 1}
				/>
			))}
		</div>
	);
}

function TournamentFormatBracketSelector({
	bracket,
	onChange,
	count,
}: {
	bracket: TournamentFormatBracket;
	onChange: (newBracket: TournamentFormatBracket) => void;
	count: number;
}) {
	const id = React.useId();

	const createId = (name: string) => {
		return `${id}-${name}`;
	};

	return (
		<div className="stack horizontal md items-center">
			<div className="format-selector__count">Bracket #{count}</div>
			<div className="format-selector__divider" />
			<div className="stack md">
				<div>
					<Label htmlFor={createId("name")}>Bracket's name</Label>
					<Input
						id={createId("name")}
						value={bracket.name}
						onChange={(e) => onChange({ ...bracket, name: e.target.value })}
					/>
				</div>

				{/** xxx: Don't show for first or disabled */}
				<div>
					<Label htmlFor={createId("startTime")}>Start time</Label>
					<DateInput id={createId("startTime")} />
					<FormMessage type="info">
						If missing, bracket can be started when the previous brackets have
						finished
					</FormMessage>
				</div>

				{/** xxx: Don't show for first or disabled */}
				<div>
					<Label htmlFor={createId("checkIn")}>Check-in required</Label>
					<Toggle checked setChecked={console.log} />
					<FormMessage type="info">
						Check-in starts 1 hour before start time or right after the previous
						bracket finishes if no start time is set
					</FormMessage>
				</div>

				<div>
					<Label htmlFor={createId("sources")}>Sources</Label>
					{/** xxx: If invitational "Participants added by the organizer" */}
					<FormMessage type="info">Participants join from sign-up</FormMessage>
				</div>

				<div>
					<Label htmlFor={createId("format")}>Format</Label>
					<select
						// value={format}
						// onChange={(e) => setFormat(e.target.value as TournamentFormatShort)}
						className="w-max"
						name="format"
						id={createId("format")}
					>
						<option value="single_elimination">Single-elimination</option>
						<option value="double_elimination">Double-elimination</option>
						<option value="round_robin">Round robin</option>
						<option value="swiss">Swiss</option>
					</select>
				</div>

				{/** xxx: Show only for single elimination */}
				<div>
					<Label htmlFor={createId("thirdPlaceMatch")}>Third place match</Label>
					<Toggle checked setChecked={console.log} />
				</div>
			</div>
		</div>
	);
}
