import { type FetcherWithComponents, Link, useFetcher } from "@remix-run/react";
import clsx from "clsx";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "~/components/Button";
import { Dialog } from "~/components/Dialog";
import { ModeImage, StageImage } from "~/components/Image";
import { Label } from "~/components/Label";
import { SubmitButton } from "~/components/SubmitButton";
import { Toggle } from "~/components/Toggle";
import { RefreshArrowsIcon } from "~/components/icons/RefreshArrows";
import type { TournamentRoundMaps } from "~/db/tables";
import {
	useTournament,
	useTournamentPreparedMaps,
} from "~/features/tournament/routes/to.$id";
import type { TournamentManagerDataSet } from "~/modules/brackets-manager/types";
import type { ModeShort, StageId } from "~/modules/in-game-lists";
import { nullFilledArray } from "~/utils/arrays";
import { databaseTimestampToDate } from "~/utils/dates";
import invariant from "~/utils/invariant";
import { assertUnreachable } from "~/utils/types";
import { calendarEditPage } from "~/utils/urls";
import type { Bracket } from "../core/Bracket";
import * as PreparedMaps from "../core/PreparedMaps";
import type { Tournament } from "../core/Tournament";
import { getRounds } from "../core/rounds";
import {
	type BracketMapCounts,
	type TournamentRoundMapList,
	generateTournamentRoundMaplist,
} from "../core/toMapList";

export function BracketMapListDialog({
	isOpen,
	close,
	bracket,
	bracketIdx,
	isPreparing,
}: {
	isOpen: boolean;
	close: () => void;
	bracket: Bracket;
	bracketIdx: number;
	isPreparing?: boolean;
}) {
	const fetcher = useFetcher();
	const tournament = useTournament();
	const untrimmedPreparedMaps = useBracketPreparedMaps(bracketIdx);

	useCloseModalOnSubmit(fetcher, close);

	const bracketTeamsCount = bracket.participantTournamentTeamIds.length;

	const preparedMaps =
		!isPreparing &&
		(bracket.type === "single_elimination" ||
			bracket.type === "double_elimination")
			? // we are about to start bracket, "trim" prepared map for actual
				PreparedMaps.trimPreparedEliminationMaps({
					preparedMaps: untrimmedPreparedMaps,
					teamCount: bracketTeamsCount,
					tournament,
					type: bracket.type,
				})
			: untrimmedPreparedMaps;

	const [eliminationTeamCount, setEliminationTeamCount] = React.useState(() => {
		if (preparedMaps?.eliminationTeamCount) {
			return preparedMaps.eliminationTeamCount;
		}

		// at least 8 for somewhat reasonable default
		return Math.max(
			PreparedMaps.eliminationTeamCountOptions(bracketTeamsCount)[0].max,
			PreparedMaps.eliminationTeamCountOptions(0)[2].max,
		);
	});

	const bracketData = isPreparing
		? teamCountAdjustedBracketData({
				bracket,
				tournament,
				teamCount: eliminationTeamCount,
			})
		: bracket.data;
	const rounds = bracketData.round;
	const defaultRoundBestOfs = bracket.defaultRoundBestOfs(bracketData);

	const [countType, setCountType] = React.useState<TournamentRoundMaps["type"]>(
		preparedMaps?.maps[0].type ?? "BEST_OF",
	);

	const [maps, setMaps] = React.useState(() => {
		if (preparedMaps) {
			return new Map(preparedMaps.maps.map((map) => [map.roundId, map]));
		}

		return generateTournamentRoundMaplist({
			mapCounts: defaultRoundBestOfs,
			roundsWithPickBan: new Set(),
			pool: tournament.ctx.toSetMapPool,
			rounds,
			type: bracket.type,
			pickBanStyle: null,
		});
	});
	const [pickBanStyle, setPickBanStyle] = React.useState(
		Array.from(maps.values()).find((round) => round.pickBan)?.pickBan,
	);
	const [hoveredMap, setHoveredMap] = React.useState<string | null>(null);

	const roundsWithPickBan = new Set(
		Array.from(maps.entries())
			.filter(([, round]) => round.pickBan)
			.map(([roundId]) => roundId),
	);

	const mapCounts = inferMapCounts({
		bracket,
		data: bracketData,
		tournamentRoundMapList: maps,
	});

	const roundsWithNames = React.useMemo(() => {
		if (bracket.type === "round_robin" || bracket.type === "swiss") {
			return Array.from(maps.keys()).map((roundId, i) => {
				return {
					id: roundId,
					name: `Round ${i + 1}`,
				};
			});
		}

		if (bracket.type === "double_elimination") {
			const winners = getRounds({ type: "winners", bracketData });
			const losers = getRounds({ type: "losers", bracketData });

			return [...winners, ...losers];
		}

		if (bracket.type === "single_elimination") {
			return getRounds({ type: "single", bracketData });
		}

		assertUnreachable(bracket.type);
	}, [bracketData, maps, bracket.type]);

	const mapCountsWithGlobalCount = (newCount: number) => {
		const newMap = new Map(defaultRoundBestOfs);

		for (const [groupId, value] of newMap.entries()) {
			const newGroupMap: typeof value = new Map(value);
			for (const [roundNumber, roundValue] of value.entries()) {
				newGroupMap.set(roundNumber, { ...roundValue, count: newCount });
			}

			newMap.set(groupId, newGroupMap);
		}

		return newMap;
	};

	const mapCountsWithGlobalPickBanStyle = (
		newPickBanStyle: TournamentRoundMaps["pickBan"],
	): Set<number> => {
		if (!newPickBanStyle) {
			return new Set();
		}

		const newRoundsWithPickBan = new Set(roundsWithPickBan);

		for (const round of roundsWithNames) {
			newRoundsWithPickBan.add(round.id);
		}

		return newRoundsWithPickBan;
	};

	// TODO: could also validate you aren't going up from winners finals to grands etc. (different groups)
	const validateNoDecreasingCount = () => {
		for (const groupCounts of mapCounts.values()) {
			let roundPreviousValue = 0;
			for (const [, roundValue] of Array.from(groupCounts.entries()).sort(
				// sort by round number
				(a, b) => a[0] - b[0],
			)) {
				if (roundPreviousValue > roundValue.count) {
					return false;
				}

				roundPreviousValue = roundValue.count;
			}
		}

		return true;
	};

	const lacksToSetMapPool =
		tournament.ctx.toSetMapPool.length === 0 &&
		tournament.ctx.mapPickingStyle === "TO";

	const globalSelections =
		bracket.type === "round_robin" || bracket.type === "swiss";

	return (
		<Dialog isOpen={isOpen} close={close} className="w-full">
			<fetcher.Form method="post" className="map-list-dialog__container">
				<input type="hidden" name="bracketIdx" value={bracketIdx} />
				<input
					type="hidden"
					name="maps"
					value={JSON.stringify(
						Array.from(maps.entries()).map(([key, value]) => ({
							...value,
							roundId: key,
							groupId: rounds.find((r) => r.id === key)?.group_id,
							type: countType,
						})),
					)}
				/>
				{isPreparing &&
				(bracket.type === "single_elimination" ||
					bracket.type === "double_elimination") ? (
					<input
						type="hidden"
						name="eliminationTeamCount"
						value={eliminationTeamCount}
					/>
				) : null}
				<div>
					<h2 className="text-lg text-center">{bracket.name}</h2>
					{preparedMaps ? (
						<div
							className="text-xs text-center text-lighter"
							suppressHydrationWarning
						>
							Prepared by{" "}
							{authorIdToUsername(tournament, preparedMaps.authorId)} @{" "}
							{databaseTimestampToDate(preparedMaps.createdAt).toLocaleString()}
						</div>
					) : null}
				</div>
				{lacksToSetMapPool ? (
					<div>
						You need to select map pool in the{" "}
						<Link to={calendarEditPage(tournament.ctx.eventId)}>
							tournament settings
						</Link>{" "}
						before bracket can be started
					</div>
				) : (
					<>
						<div className="stack horizontal items-center justify-between">
							<div className="stack horizontal lg flex-wrap">
								<PickBanSelect
									pickBanStyle={pickBanStyle}
									onPickBanStyleChange={(pickBanStyle) => {
										let newRoundsWithPickBan = roundsWithPickBan;
										if (globalSelections) {
											newRoundsWithPickBan =
												mapCountsWithGlobalPickBanStyle(pickBanStyle);
										}

										setPickBanStyle(pickBanStyle);
										setMaps(
											generateTournamentRoundMaplist({
												mapCounts,
												pool: tournament.ctx.toSetMapPool,
												rounds,
												type: bracket.type,
												roundsWithPickBan: newRoundsWithPickBan,
												pickBanStyle,
											}),
										);
									}}
								/>
								{isPreparing &&
								(bracket.type === "single_elimination" ||
									bracket.type === "double_elimination") ? (
									<EliminationTeamCountSelect
										count={eliminationTeamCount}
										realCount={bracketTeamsCount}
										setCount={(newCount) => {
											const newBracketData = teamCountAdjustedBracketData({
												bracket,
												tournament,
												teamCount: newCount,
											});

											setMaps(
												generateTournamentRoundMaplist({
													mapCounts:
														bracket.defaultRoundBestOfs(newBracketData),
													pool: tournament.ctx.toSetMapPool,
													rounds: newBracketData.round,
													type: bracket.type,
													roundsWithPickBan,
													pickBanStyle,
												}),
											);
											setEliminationTeamCount(newCount);
										}}
									/>
								) : null}
								{globalSelections ? (
									<GlobalMapCountInput
										defaultValue={
											// beautiful 🥹
											mapCounts.values().next().value.values().next().value
												.count
										}
										onSetCount={(newCount) => {
											const newMapCounts = mapCountsWithGlobalCount(newCount);
											const newMaps = generateTournamentRoundMaplist({
												mapCounts: newMapCounts,
												pool: tournament.ctx.toSetMapPool,
												rounds,
												type: bracket.type,
												roundsWithPickBan,
												pickBanStyle,
											});
											setMaps(newMaps);
										}}
									/>
								) : null}
								{globalSelections ? (
									<GlobalCountTypeSelect
										defaultValue={countType}
										onSetCountType={setCountType}
									/>
								) : null}
							</div>
							{tournament.ctx.toSetMapPool.length > 0 ? (
								<Button
									size="tiny"
									icon={<RefreshArrowsIcon />}
									variant="outlined"
									onClick={() =>
										setMaps(
											generateTournamentRoundMaplist({
												mapCounts,
												pool: tournament.ctx.toSetMapPool,
												rounds,
												type: bracket.type,
												roundsWithPickBan,
												pickBanStyle,
											}),
										)
									}
								>
									Reroll all maps
								</Button>
							) : null}
						</div>
						<div className="stack horizontal md flex-wrap justify-center">
							{roundsWithNames.map((round) => {
								const roundMaps = maps.get(round.id);
								invariant(roundMaps, "Expected maps to be defined");

								return (
									<RoundMapList
										key={round.id}
										name={round.name}
										maps={roundMaps}
										onHoverMap={setHoveredMap}
										hoveredMap={hoveredMap}
										includeRoundSpecificSelections={
											bracket.type !== "round_robin"
										}
										onCountChange={(newCount) => {
											const newMapCounts = new Map(mapCounts);
											const bracketRound = rounds.find(
												(r) => r.id === round.id,
											);
											invariant(bracketRound, "Expected round to be defined");

											const groupInfo = newMapCounts.get(bracketRound.group_id);
											invariant(groupInfo, "Expected group info to be defined");
											const oldMapInfo = newMapCounts
												.get(bracketRound.group_id)
												?.get(bracketRound.number);
											invariant(oldMapInfo, "Expected map info to be defined");

											groupInfo.set(bracketRound.number, {
												...oldMapInfo,
												count: newCount,
											});

											const newMaps = generateTournamentRoundMaplist({
												mapCounts: newMapCounts,
												pool: tournament.ctx.toSetMapPool,
												rounds,
												type: bracket.type,
												roundsWithPickBan,
												pickBanStyle,
											});
											setMaps(newMaps);
										}}
										onPickBanChange={
											pickBanStyle
												? (hasPickBan) => {
														const newRoundsWithPickBan = new Set(
															roundsWithPickBan,
														);
														if (hasPickBan) {
															newRoundsWithPickBan.add(round.id);
														} else {
															newRoundsWithPickBan.delete(round.id);
														}

														setMaps(
															generateTournamentRoundMaplist({
																mapCounts,
																pool: tournament.ctx.toSetMapPool,
																rounds,
																type: bracket.type,
																roundsWithPickBan: newRoundsWithPickBan,
																pickBanStyle,
															}),
														);
													}
												: undefined
										}
										onRoundMapListChange={(newRoundMaps) => {
											const newMaps = new Map(maps);
											newMaps.set(round.id, newRoundMaps);

											setMaps(newMaps);
										}}
									/>
								);
							})}
						</div>
						{!validateNoDecreasingCount() ? (
							<div className="text-warning text-center">
								Invalid selection: tournament progression decreases in map count
							</div>
						) : pickBanStyle && roundsWithPickBan.size === 0 ? (
							<div className="text-warning text-center">
								Invalid selection: pick/ban style selected but no rounds have it
								enabled
							</div>
						) : (
							<SubmitButton
								variant="outlined"
								size="tiny"
								testId="confirm-finalize-bracket-button"
								_action={isPreparing ? "PREPARE_MAPS" : "START_BRACKET"}
								className="mx-auto"
							>
								{isPreparing ? "Save the maps" : "Start the bracket"}
							</SubmitButton>
						)}
					</>
				)}
			</fetcher.Form>
		</Dialog>
	);
}

function useCloseModalOnSubmit(
	fetcher: FetcherWithComponents<unknown>,
	close: () => void,
) {
	React.useEffect(() => {
		if (fetcher.state !== "loading") return;

		close();
	}, [fetcher.state, close]);
}

function inferMapCounts({
	bracket,
	data,
	tournamentRoundMapList,
}: {
	bracket: Bracket;
	data: TournamentManagerDataSet;
	tournamentRoundMapList: TournamentRoundMapList;
}) {
	const result: BracketMapCounts = new Map();

	for (const [groupId, value] of bracket.defaultRoundBestOfs(data).entries()) {
		for (const roundNumber of value.keys()) {
			const roundId = data.round.find(
				(round) => round.group_id === groupId && round.number === roundNumber,
			)?.id;
			invariant(typeof roundId === "number", "Expected roundId to be defined");

			const count = tournamentRoundMapList.get(roundId)?.count;

			// skip rounds in RR and Swiss that don't have maps (only one group has maps)
			if (typeof count !== "number") {
				continue;
			}

			result.set(
				groupId,
				new Map(result.get(groupId)).set(roundNumber, {
					count,
					// currently "best of" / "play all" is defined per bracket but in future it might be per round
					// that's why there is this hardcoded default value for now
					type: "BEST_OF",
				}),
			);
		}
	}

	invariant(result.size > 0, "Expected result to be defined");

	return result;
}

function useBracketPreparedMaps(bracketIdx: number) {
	const prepared = useTournamentPreparedMaps();
	const tournament = useTournament();

	return PreparedMaps.resolvePreparedForTheBracket({
		bracketIdx,
		preparedByBracket: prepared,
		tournament,
	});
}

function authorIdToUsername(tournament: Tournament, authorId: number) {
	if (tournament.ctx.author.id === authorId) {
		return tournament.ctx.author.username;
	}

	return (
		tournament.ctx.staff.find((staff) => staff.id === authorId)?.username ??
		tournament.ctx.organization?.members.find(
			(member) => member.userId === authorId,
		)?.username ??
		"???"
	);
}

function teamCountAdjustedBracketData({
	bracket,
	tournament,
	teamCount,
}: { bracket: Bracket; tournament: Tournament; teamCount: number }) {
	switch (bracket.type) {
		// RR & swiss are different because for those the amount of participants won't affect the amount of rounds
		case "round_robin":
		case "swiss":
			return bracket.data;
		case "single_elimination":
			return tournament.generateMatchesData(
				nullFilledArray(teamCount).map((_, i) => i + 1),
				"single_elimination",
			);
		case "double_elimination":
			return tournament.generateMatchesData(
				nullFilledArray(teamCount).map((_, i) => i + 1),
				"double_elimination",
			);
	}
}

function EliminationTeamCountSelect({
	count,
	realCount,
	setCount,
}: {
	count: number;
	realCount: number;
	setCount: (count: number) => void;
}) {
	return (
		<div>
			<Label htmlFor="elimination-team-count">Expected teams</Label>
			<select
				id="elimination-team-count"
				onChange={(e) => setCount(Number(e.target.value))}
				defaultValue={count}
			>
				{PreparedMaps.eliminationTeamCountOptions(realCount).map(
					(teamCountRange) => {
						const label =
							teamCountRange.min === teamCountRange.max
								? teamCountRange.min
								: `${teamCountRange.min}-${teamCountRange.max}`;

						return (
							<option key={teamCountRange.max} value={teamCountRange.max}>
								{label}
							</option>
						);
					},
				)}
			</select>
		</div>
	);
}

function GlobalMapCountInput({
	defaultValue = 3,
	onSetCount,
}: {
	defaultValue?: number;
	onSetCount: (bestOf: number) => void;
}) {
	return (
		<div>
			<Label htmlFor="count">Count</Label>
			<select
				id="count"
				onChange={(e) => onSetCount(Number(e.target.value))}
				defaultValue={defaultValue}
			>
				<option value="3">3</option>
				<option value="5">5</option>
				<option value="7">7</option>
			</select>
		</div>
	);
}

function GlobalCountTypeSelect({
	defaultValue,
	onSetCountType,
}: {
	defaultValue: TournamentRoundMaps["type"];
	onSetCountType: (type: TournamentRoundMaps["type"]) => void;
}) {
	return (
		<div>
			<Label htmlFor="count-type">Count type</Label>
			<select
				id="count-type"
				onChange={(e) =>
					onSetCountType(e.target.value as TournamentRoundMaps["type"])
				}
				defaultValue={defaultValue}
			>
				<option value="BEST_OF">Best of</option>
				<option value="PLAY_ALL">Play all</option>
			</select>
		</div>
	);
}

function PickBanSelect({
	pickBanStyle,
	onPickBanStyleChange,
}: {
	pickBanStyle: TournamentRoundMaps["pickBan"];
	onPickBanStyleChange: (pickBanStyle: TournamentRoundMaps["pickBan"]) => void;
}) {
	return (
		<div>
			<Label htmlFor="pick-ban-style">Pick/ban</Label>
			<select
				id="pick-ban-style"
				value={pickBanStyle ?? "NONE"}
				onChange={(e) =>
					onPickBanStyleChange(
						e.target.value === "NONE"
							? undefined
							: (e.target.value as TournamentRoundMaps["pickBan"]),
					)
				}
			>
				<option value="NONE">None</option>
				<option value="COUNTERPICK">Counterpick</option>
				<option value="BAN_2">Ban 2</option>
			</select>
		</div>
	);
}

const serializedMapMode = (
	map: NonNullable<TournamentRoundMaps["list"]>[number],
) => `${map.mode}-${map.stageId}`;

function RoundMapList({
	name,
	maps,
	onRoundMapListChange,
	onHoverMap,
	onCountChange,
	onPickBanChange,
	hoveredMap,
	includeRoundSpecificSelections,
}: {
	name: string;
	maps: Omit<TournamentRoundMaps, "type">;
	onRoundMapListChange: (maps: Omit<TournamentRoundMaps, "type">) => void;
	onHoverMap: (map: string | null) => void;
	onCountChange: (count: number) => void;
	onPickBanChange?: (hasPickBan: boolean) => void;
	hoveredMap: string | null;
	includeRoundSpecificSelections: boolean;
}) {
	const id = React.useId();
	const [editing, setEditing] = React.useState(false);

	return (
		<div>
			<h3 className="stack horizontal sm">
				<div>{name}</div>{" "}
				<Button
					variant={editing ? "minimal-success" : "minimal"}
					onClick={() => setEditing(!editing)}
					testId="edit-round-maps-button"
				>
					{editing ? "Save" : "Edit"}
				</Button>
			</h3>
			{editing && includeRoundSpecificSelections ? (
				<div className="stack xs horizontal">
					{[3, 5, 7].map((count) => (
						<div key={count}>
							<Label htmlFor={`bo-${count}-${id}`}>Bo{count}</Label>
							<input
								id={`bo-${count}-${id}`}
								type="radio"
								value={count}
								checked={maps.count === count}
								onChange={() => onCountChange(count)}
							/>
						</div>
					))}
					{onPickBanChange ? (
						<div>
							<Label htmlFor={`pick-ban-${id}`}>Pick/ban</Label>
							<Toggle
								tiny
								checked={Boolean(maps.pickBan)}
								setChecked={onPickBanChange}
								id={`pick-ban-${id}`}
							/>
						</div>
					) : null}
				</div>
			) : null}
			<ol className="pl-0">
				{nullFilledArray(
					maps.pickBan === "BAN_2" ? maps.count + 2 : maps.count,
				).map((_, i) => {
					const map = maps.list?.[i];

					if (map) {
						return (
							<MapListRow
								key={i}
								map={map}
								number={i + 1}
								editing={editing}
								onHoverMap={onHoverMap}
								hoveredMap={hoveredMap}
								onMapChange={(map) => {
									onRoundMapListChange({
										...maps,
										list: maps.list?.map((m, j) => (i === j ? map : m)),
									});
								}}
							/>
						);
					}

					const isTeamsPick = !maps.list && i === 0;

					return (
						<MysteryRow
							key={i}
							number={i + 1}
							isCounterpicks={!isTeamsPick && maps.pickBan === "COUNTERPICK"}
						/>
					);
				})}
			</ol>
		</div>
	);
}

function MapListRow({
	map,
	number,
	editing,
	onMapChange,
	onHoverMap,
	hoveredMap,
}: {
	map: NonNullable<TournamentRoundMaps["list"]>[number];
	number: number;
	editing: boolean;
	onMapChange: (map: NonNullable<TournamentRoundMaps["list"]>[number]) => void;
	onHoverMap: (map: string | null) => void;
	hoveredMap: string | null;
}) {
	const { t } = useTranslation(["game-misc"]);
	const tournament = useTournament();

	if (editing) {
		return (
			<li className="map-list-dialog__map-list-row">
				<div className="stack horizontal items-center xs">
					<span className="text-lg">{number}.</span>
					<select
						value={serializedMapMode(map)}
						onChange={(e) => {
							const [mode, stageId] = e.target.value.split("-");
							onMapChange({
								mode: mode as ModeShort,
								stageId: Number(stageId) as StageId,
							});
						}}
					>
						{tournament.ctx.toSetMapPool.map((map) => (
							<option
								key={serializedMapMode(map)}
								value={serializedMapMode(map)}
							>
								{t(`game-misc:MODE_SHORT_${map.mode}`)}{" "}
								{t(`game-misc:STAGE_${map.stageId}`)}
							</option>
						))}
					</select>
				</div>
			</li>
		);
	}

	return (
		<li
			className={clsx("map-list-dialog__map-list-row", {
				"text-theme-secondary underline": serializedMapMode(map) === hoveredMap,
			})}
			onMouseEnter={() => onHoverMap(serializedMapMode(map))}
		>
			<div className="stack horizontal items-center xs">
				<span className="text-lg">{number}.</span>
				<ModeImage mode={map.mode} size={24} />
				<StageImage stageId={map.stageId} height={24} className="rounded-sm" />
				{t(`game-misc:STAGE_${map.stageId}`)}
			</div>
		</li>
	);
}

function MysteryRow({
	number,
	isCounterpicks,
}: {
	number: number;
	isCounterpicks: boolean;
}) {
	return (
		<li className="map-list-dialog__map-list-row">
			<div
				className={clsx("stack horizontal items-center xs text-lighter", {
					"text-info": isCounterpicks,
				})}
			>
				<span className="text-lg">{number}.</span>
				{isCounterpicks ? <>Counterpick</> : <>Team&apos;s pick</>}
			</div>
		</li>
	);
}
