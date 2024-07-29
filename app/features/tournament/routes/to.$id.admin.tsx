import type { ActionFunction } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { Avatar } from "~/components/Avatar";
import { Button, LinkButton } from "~/components/Button";
import { Divider } from "~/components/Divider";
import { FormMessage } from "~/components/FormMessage";
import { FormWithConfirm } from "~/components/FormWithConfirm";
import { Input } from "~/components/Input";
import { Label } from "~/components/Label";
import { Redirect } from "~/components/Redirect";
import { SubmitButton } from "~/components/SubmitButton";
import { UserSearch } from "~/components/UserSearch";
import { TrashIcon } from "~/components/icons/Trash";
import { USER } from "~/constants";
import { useUser } from "~/features/auth/core/user";
import { requireUserId } from "~/features/auth/core/user.server";
import { userIsBanned } from "~/features/ban/core/banned.server";
import type { TournamentData } from "~/features/tournament-bracket/core/Tournament.server";
import {
	clearTournamentDataCache,
	tournamentFromDB,
} from "~/features/tournament-bracket/core/Tournament.server";
import * as TournamentTeamRepository from "~/features/tournament/TournamentTeamRepository.server";
import { databaseTimestampToDate } from "~/utils/dates";
import invariant from "~/utils/invariant";
import { logger } from "~/utils/logger";
import {
	badRequestIfFalsy,
	parseRequestPayload,
	validate,
} from "~/utils/remix";
import { assertUnreachable } from "~/utils/types";
import {
	calendarEditPage,
	calendarEventPage,
	tournamentPage,
} from "~/utils/urls";
import * as TournamentRepository from "../TournamentRepository.server";
import { changeTeamOwner } from "../queries/changeTeamOwner.server";
import { deleteTeam } from "../queries/deleteTeam.server";
import { joinTeam, leaveTeam } from "../queries/joinLeaveTeam.server";
import { adminActionSchema } from "../tournament-schemas.server";
import { tournamentIdFromParams } from "../tournament-utils";
import { inGameNameIfNeeded } from "../tournament-utils.server";
import { useTournament } from "./to.$id";

export const action: ActionFunction = async ({ request, params }) => {
	const user = await requireUserId(request);
	const data = await parseRequestPayload({
		request,
		schema: adminActionSchema,
	});

	const tournamentId = tournamentIdFromParams(params);
	const tournament = await tournamentFromDB({ tournamentId, user });

	const validateIsTournamentAdmin = () =>
		validate(tournament.isAdmin(user), "Unauthorized", 401);
	const validateIsTournamentOrganizer = () =>
		validate(tournament.isOrganizer(user), "Unauthorized", 401);

	switch (data._action) {
		case "ADD_TEAM": {
			validateIsTournamentOrganizer();
			validate(
				tournament.ctx.teams.every((t) => t.name !== data.teamName),
				"Team name taken",
			);
			validate(
				!tournament.teamMemberOfByUser({ id: data.userId }),
				"User already on a team",
			);

			await TournamentTeamRepository.create({
				ownerInGameName: await inGameNameIfNeeded({
					tournament,
					userId: data.userId,
				}),
				team: {
					name: data.teamName,
					noScreen: 0,
					prefersNotToHost: 0,
					teamId: null,
				},
				userId: data.userId,
				tournamentId,
			});

			break;
		}
		case "CHANGE_TEAM_OWNER": {
			validateIsTournamentOrganizer();
			const team = tournament.teamById(data.teamId);
			validate(team, "Invalid team id");
			const oldCaptain = team.members.find((m) => m.isOwner);
			invariant(oldCaptain, "Team has no captain");
			const newCaptain = team.members.find((m) => m.userId === data.memberId);
			validate(newCaptain, "Invalid member id");

			changeTeamOwner({
				newCaptainId: data.memberId,
				oldCaptainId: oldCaptain.userId,
				tournamentTeamId: data.teamId,
			});

			break;
		}
		case "CHANGE_TEAM_NAME": {
			validateIsTournamentOrganizer();
			validate(!tournament.hasStarted, "Tournament started");
			const team = tournament.teamById(data.teamId);
			validate(team, "Invalid team id");

			await TournamentRepository.updateTeamName({
				tournamentTeamId: data.teamId,
				name: data.teamName,
			});
			break;
		}
		case "CHECK_IN": {
			validateIsTournamentOrganizer();
			const team = tournament.teamById(data.teamId);
			validate(team, "Invalid team id");
			validate(
				data.bracketIdx !== 0 ||
					tournament.checkInConditionsFulfilledByTeamId(team.id),
				"Can't check-in",
			);
			validate(
				team.checkIns.length > 0 || data.bracketIdx === 0,
				"Can't check-in to follow up bracket if not checked in for the event itself",
			);

			const bracket = tournament.bracketByIdx(data.bracketIdx);
			invariant(bracket, "Invalid bracket idx");
			validate(bracket.preview, "Bracket has been started");

			await TournamentRepository.checkIn({
				tournamentTeamId: data.teamId,
				// 0 = regular check in
				bracketIdx: data.bracketIdx === 0 ? null : data.bracketIdx,
			});
			break;
		}
		case "CHECK_OUT": {
			validateIsTournamentOrganizer();
			const team = tournament.teamById(data.teamId);
			validate(team, "Invalid team id");
			validate(
				data.bracketIdx !== 0 || !tournament.hasStarted,
				"Tournament has started",
			);

			const bracket = tournament.bracketByIdx(data.bracketIdx);
			invariant(bracket, "Invalid bracket idx");
			validate(bracket.preview, "Bracket has been started");

			await TournamentRepository.checkOut({
				tournamentTeamId: data.teamId,
				// 0 = regular check in
				bracketIdx: data.bracketIdx === 0 ? null : data.bracketIdx,
			});
			logger.info(
				`Checked out: tournament team id: ${data.teamId} - user id: ${user.id} - tournament id: ${tournamentId} - bracket idx: ${data.bracketIdx}`,
			);
			break;
		}
		case "REMOVE_MEMBER": {
			validateIsTournamentOrganizer();
			const team = tournament.teamById(data.teamId);
			validate(team, "Invalid team id");
			validate(
				team.checkIns.length === 0 || team.members.length > 4,
				"Can't remove last member from checked in team",
			);
			validate(
				!team.members.find((m) => m.userId === data.memberId)?.isOwner,
				"Cannot remove team owner",
			);
			validate(
				!tournament.hasStarted ||
					!tournament
						.participatedPlayersByTeamId(data.teamId)
						.some((p) => p.userId === data.memberId),
				"Cannot remove player that has participated in the tournament",
			);

			leaveTeam({
				userId: data.memberId,
				teamId: team.id,
			});
			break;
		}
		case "ADD_MEMBER": {
			validateIsTournamentOrganizer();
			const team = tournament.teamById(data.teamId);
			validate(team, "Invalid team id");

			const previousTeam = tournament.teamMemberOfByUser({ id: data.userId });

			if (tournament.hasStarted) {
				validate(
					!previousTeam || previousTeam.checkIns.length === 0,
					"User is already on a checked in team",
				);
			} else {
				validate(!previousTeam, "User is already on a team");
			}

			validate(
				!userIsBanned(data.userId),
				"User trying to be added currently has an active ban from sendou.ink",
			);

			joinTeam({
				userId: data.userId,
				newTeamId: team.id,
				previousTeamId: previousTeam?.id,
				// this team is not checked in so we can simply delete it
				whatToDoWithPreviousTeam: previousTeam ? "DELETE" : undefined,
				tournamentId,
				inGameName: await inGameNameIfNeeded({
					tournament,
					userId: data.userId,
				}),
			});
			break;
		}
		case "DELETE_TEAM": {
			validateIsTournamentOrganizer();
			const team = tournament.teamById(data.teamId);
			validate(team, "Invalid team id");
			validate(!tournament.hasStarted, "Tournament has started");

			deleteTeam(team.id);
			break;
		}
		case "ADD_STAFF": {
			validateIsTournamentAdmin();
			await TournamentRepository.addStaff({
				role: data.role,
				tournamentId: tournament.ctx.id,
				userId: data.userId,
			});
			break;
		}
		case "REMOVE_STAFF": {
			validateIsTournamentAdmin();
			await TournamentRepository.removeStaff({
				tournamentId: tournament.ctx.id,
				userId: data.userId,
			});
			break;
		}
		case "UPDATE_CAST_TWITCH_ACCOUNTS": {
			validateIsTournamentOrganizer();
			await TournamentRepository.updateCastTwitchAccounts({
				tournamentId: tournament.ctx.id,
				castTwitchAccounts: data.castTwitchAccounts,
			});
			break;
		}
		case "DROP_TEAM_OUT": {
			validateIsTournamentOrganizer();
			await TournamentRepository.dropTeamOut({
				tournamentTeamId: data.teamId,
				previewBracketIdxs: tournament.brackets.flatMap((b, idx) =>
					b.preview ? idx : [],
				),
			});
			break;
		}
		case "UNDO_DROP_TEAM_OUT": {
			validateIsTournamentOrganizer();

			await TournamentRepository.undoDropTeamOut(data.teamId);
			break;
		}
		case "RESET_BRACKET": {
			validateIsTournamentOrganizer();
			validate(!tournament.ctx.isFinalized, "Tournament is finalized");

			const bracketToResetIdx = tournament.brackets.findIndex(
				(b) => b.id === data.stageId,
			);
			const bracketToReset = tournament.brackets[bracketToResetIdx];
			validate(bracketToReset, "Invalid bracket id");
			validate(!bracketToReset.preview, "Bracket has not started");

			const inProgressBrackets = tournament.brackets.filter((b) => !b.preview);
			validate(
				inProgressBrackets.every(
					(b) =>
						!b.sources ||
						b.sources.every((s) => s.bracketIdx !== bracketToResetIdx),
				),
				"Some bracket that sources teams from this bracket has started",
			);

			await TournamentRepository.resetBracket(data.stageId);

			break;
		}
		case "UPDATE_IN_GAME_NAME": {
			validateIsTournamentOrganizer();

			const teamMemberOf = badRequestIfFalsy(
				tournament.teamMemberOfByUser({ id: data.memberId }),
			);

			await TournamentTeamRepository.updateMemberInGameName({
				userId: data.memberId,
				inGameName: `${data.inGameNameText}#${data.inGameNameDiscriminator}`,
				tournamentTeamId: teamMemberOf.id,
			});
			break;
		}
		case "DELETE_LOGO": {
			validateIsTournamentOrganizer();

			await TournamentTeamRepository.deleteLogo(data.teamId);

			break;
		}
		default: {
			assertUnreachable(data);
		}
	}

	clearTournamentDataCache(tournamentId);

	return null;
};

// TODO: translations
export default function TournamentAdminPage() {
	const { t } = useTranslation(["calendar"]);
	const tournament = useTournament();

	const user = useUser();

	if (!tournament.isOrganizer(user) || tournament.everyBracketOver) {
		return <Redirect to={tournamentPage(tournament.ctx.id)} />;
	}

	return (
		<div className="stack lg">
			{tournament.isAdmin(user) && !tournament.hasStarted ? (
				<div className="stack horizontal items-end">
					<LinkButton
						to={calendarEditPage(tournament.ctx.eventId)}
						size="tiny"
						variant="outlined"
						testId="edit-event-info-button"
					>
						Edit event info
					</LinkButton>
					<FormWithConfirm
						dialogHeading={t("calendar:actions.delete.confirm", {
							name: tournament.ctx.name,
						})}
						action={calendarEventPage(tournament.ctx.eventId)}
						submitButtonTestId="delete-submit-button"
					>
						<Button
							className="ml-auto"
							size="tiny"
							variant="minimal-destructive"
							type="submit"
						>
							{t("calendar:actions.delete")}
						</Button>
					</FormWithConfirm>
				</div>
			) : null}
			<Divider smallText>Team actions</Divider>
			<TeamActions />
			{tournament.isAdmin(user) ? (
				<>
					<Divider smallText>Staff</Divider>
					<Staff />
				</>
			) : null}
			<Divider smallText>Cast Twitch Accounts</Divider>
			<CastTwitchAccounts />
			<Divider smallText>Participant list download</Divider>
			<DownloadParticipants />
			<Divider smallText>Bracket reset</Divider>
			<BracketReset />
		</div>
	);
}

type InputType =
	| "TEAM_NAME"
	| "REGISTERED_TEAM"
	| "USER"
	| "ROSTER_MEMBER"
	| "BRACKET"
	| "IN_GAME_NAME";
const actions = [
	{
		type: "ADD_TEAM",
		inputs: ["USER", "TEAM_NAME"] as InputType[],
		when: ["TOURNAMENT_BEFORE_START"],
	},
	{
		type: "CHANGE_TEAM_NAME",
		inputs: ["REGISTERED_TEAM", "TEAM_NAME"] as InputType[],
		when: ["TOURNAMENT_BEFORE_START"],
	},
	{
		type: "CHANGE_TEAM_OWNER",
		inputs: ["ROSTER_MEMBER", "REGISTERED_TEAM"] as InputType[],
		when: [],
	},
	{
		type: "CHECK_IN",
		inputs: ["REGISTERED_TEAM", "BRACKET"] as InputType[],
		when: ["CHECK_IN_STARTED"],
	},
	{
		type: "CHECK_OUT",
		inputs: ["REGISTERED_TEAM", "BRACKET"] as InputType[],
		when: ["CHECK_IN_STARTED"],
	},
	{
		type: "ADD_MEMBER",
		inputs: ["USER", "REGISTERED_TEAM"] as InputType[],
		when: [],
	},
	{
		type: "REMOVE_MEMBER",
		inputs: ["ROSTER_MEMBER", "REGISTERED_TEAM"] as InputType[],
		when: [],
	},
	{
		type: "DELETE_TEAM",
		inputs: ["REGISTERED_TEAM"] as InputType[],
		when: ["TOURNAMENT_BEFORE_START"],
	},
	{
		type: "DROP_TEAM_OUT",
		inputs: ["REGISTERED_TEAM"] as InputType[],
		when: ["TOURNAMENT_AFTER_START", "IS_SWISS"],
	},
	{
		type: "UNDO_DROP_TEAM_OUT",
		inputs: ["REGISTERED_TEAM"] as InputType[],
		when: ["TOURNAMENT_AFTER_START", "IS_SWISS"],
	},
	{
		type: "UPDATE_IN_GAME_NAME",
		inputs: ["ROSTER_MEMBER", "REGISTERED_TEAM", "IN_GAME_NAME"] as InputType[],
		when: ["IN_GAME_NAME_REQUIRED"],
	},
	{
		type: "DELETE_LOGO",
		inputs: ["REGISTERED_TEAM"] as InputType[],
		when: [],
	},
] as const;

function TeamActions() {
	const fetcher = useFetcher();
	const { t } = useTranslation(["tournament"]);
	const tournament = useTournament();
	const [selectedTeamId, setSelectedTeamId] = React.useState(
		tournament.ctx.teams[0]?.id,
	);
	const [selectedAction, setSelectedAction] = React.useState<
		(typeof actions)[number]
	>(
		// if started, default to action with no restrictions
		tournament.hasStarted
			? actions.find((a) => a.when.length === 0)!
			: actions[0],
	);

	const selectedTeam = tournament.teamById(selectedTeamId);

	const actionsToShow = actions.filter((action) => {
		for (const when of action.when) {
			switch (when) {
				case "CHECK_IN_STARTED": {
					if (!tournament.regularCheckInStartInThePast) {
						return false;
					}

					break;
				}
				case "TOURNAMENT_BEFORE_START": {
					if (tournament.hasStarted) {
						return false;
					}

					break;
				}
				case "TOURNAMENT_AFTER_START": {
					if (!tournament.hasStarted) {
						return false;
					}

					break;
				}
				case "IS_SWISS": {
					if (!tournament.brackets.some((b) => b.type === "swiss")) {
						return false;
					}

					break;
				}
				case "IN_GAME_NAME_REQUIRED": {
					if (!tournament.ctx.settings.requireInGameNames) {
						return false;
					}

					break;
				}
				default: {
					assertUnreachable(when);
				}
			}
		}

		return true;
	});

	return (
		<fetcher.Form
			method="post"
			className="stack horizontal sm items-end flex-wrap"
		>
			<div>
				<label htmlFor="action">Action</label>
				<select
					id="action"
					name="action"
					value={selectedAction.type}
					onChange={(e) =>
						setSelectedAction(actions.find((a) => a.type === e.target.value)!)
					}
				>
					{actionsToShow.map((action) => (
						<option key={action.type} value={action.type}>
							{t(`tournament:admin.actions.${action.type}`)}
						</option>
					))}
				</select>
			</div>
			{selectedAction.inputs.includes("REGISTERED_TEAM") ? (
				<div>
					<label htmlFor="teamId">Team</label>
					<select
						id="teamId"
						name="teamId"
						value={selectedTeamId}
						onChange={(e) => setSelectedTeamId(Number(e.target.value))}
					>
						{tournament.ctx.teams
							.slice()
							.sort((a, b) => a.name.localeCompare(b.name))
							.map((team) => (
								<option key={team.id} value={team.id}>
									{team.name}
								</option>
							))}
					</select>
				</div>
			) : null}
			{selectedAction.inputs.includes("TEAM_NAME") ? (
				<div>
					<label htmlFor="teamName">Team name</label>
					<input id="teamName" name="teamName" />
				</div>
			) : null}
			{selectedTeam && selectedAction.inputs.includes("ROSTER_MEMBER") ? (
				<div>
					<label htmlFor="memberId">Member</label>
					<select id="memberId" name="memberId">
						{selectedTeam.members.map((member) => (
							<option key={member.userId} value={member.userId}>
								{member.username}
							</option>
						))}
					</select>
				</div>
			) : null}
			{selectedAction.inputs.includes("USER") ? (
				<div>
					<label htmlFor="user">User</label>
					<UserSearch inputName="userId" id="user" />
				</div>
			) : null}
			{selectedAction.inputs.includes("BRACKET") ? (
				<div>
					<label htmlFor="bracket">Bracket</label>
					<select id="bracket" name="bracketIdx">
						{tournament.brackets.map((bracket, bracketIdx) => (
							<option key={bracket.name} value={bracketIdx}>
								{bracket.name}
							</option>
						))}
					</select>
				</div>
			) : null}
			{selectedTeam && selectedAction.inputs.includes("IN_GAME_NAME") ? (
				<div className="stack items-start">
					<Label>New IGN</Label>
					<div className="stack horizontal sm items-center">
						<Input
							name="inGameNameText"
							aria-label="In game name"
							maxLength={USER.IN_GAME_NAME_TEXT_MAX_LENGTH}
						/>
						<div className="u-edit__in-game-name-hashtag">#</div>
						<Input
							name="inGameNameDiscriminator"
							aria-label="In game name discriminator"
							maxLength={USER.IN_GAME_NAME_DISCRIMINATOR_MAX_LENGTH}
							pattern="[0-9a-z]{4,5}"
						/>
					</div>
				</div>
			) : null}
			<SubmitButton
				_action={selectedAction.type}
				state={fetcher.state}
				variant={
					selectedAction.type === "DELETE_TEAM" ? "destructive" : undefined
				}
			>
				Go
			</SubmitButton>
		</fetcher.Form>
	);
}

function Staff() {
	const tournament = useTournament();

	return (
		<div className="stack lg">
			{/* Key so inputs are cleared after staff is added */}
			<StaffAdder key={tournament.ctx.staff.length} />
			<StaffList />
		</div>
	);
}

function CastTwitchAccounts() {
	const id = React.useId();
	const fetcher = useFetcher();
	const tournament = useTournament();

	return (
		<fetcher.Form method="post" className="stack sm">
			<div className="stack horizontal sm items-end">
				<div>
					<Label htmlFor={id}>Twitch accounts</Label>
					<input
						id={id}
						placeholder="dappleproductions"
						name="castTwitchAccounts"
						defaultValue={tournament.ctx.castTwitchAccounts?.join(",")}
					/>
				</div>
				<SubmitButton
					testId="save-cast-twitch-accounts-button"
					state={fetcher.state}
					_action="UPDATE_CAST_TWITCH_ACCOUNTS"
				>
					Save
				</SubmitButton>
			</div>
			<FormMessage type="info">
				Twitch account where the tournament is casted. Player streams are added
				automatically based on their profile data. You can also enter multiple
				accounts, just separate them with a comma e.g.
				&quot;sendouc,leanny&quot;
			</FormMessage>
		</fetcher.Form>
	);
}

function StaffAdder() {
	const fetcher = useFetcher();
	const tournament = useTournament();

	return (
		<fetcher.Form method="post" className="stack sm">
			<div className="stack horizontal sm flex-wrap items-end">
				<div>
					<Label htmlFor="staff-user">New staffer</Label>
					<UserSearch
						inputName="userId"
						id="staff-user"
						required
						userIdsToOmit={
							new Set([
								tournament.ctx.author.id,
								...tournament.ctx.staff.map((s) => s.id),
							])
						}
					/>
				</div>
				<div>
					<Label htmlFor="staff-role">Role</Label>
					<select name="role" id="staff-role" className="w-max">
						<option value="ORGANIZER">Organizer</option>
						<option value="STREAMER">Streamer</option>
					</select>
				</div>
				<SubmitButton
					state={fetcher.state}
					_action="ADD_STAFF"
					testId="add-staff-button"
				>
					Add
				</SubmitButton>
			</div>
			<FormMessage type="info">
				Organizer has same permissions as you expect adding/removing staff,
				editing calendar event info and deleting the tournament. Streamer can
				only talk in chats and see room password/pool.
			</FormMessage>
		</fetcher.Form>
	);
}

function StaffList() {
	const { t } = useTranslation(["tournament"]);
	const tournament = useTournament();

	return (
		<div className="stack md">
			{tournament.ctx.staff.map((staff) => (
				<div
					key={staff.id}
					className="stack horizontal sm items-center"
					data-testid={`staff-id-${staff.id}`}
				>
					<Avatar size="xs" user={staff} />{" "}
					<div className="mr-4">
						<div>{staff.username}</div>
						<div className="text-lighter text-xs text-capitalize">
							{t(`tournament:staff.role.${staff.role}`)}
						</div>
					</div>
					<RemoveStaffButton staff={staff} />
				</div>
			))}
		</div>
	);
}

function RemoveStaffButton({
	staff,
}: {
	staff: TournamentData["ctx"]["staff"][number];
}) {
	const { t } = useTranslation(["tournament"]);

	return (
		<FormWithConfirm
			dialogHeading={`Remove ${staff.username} as ${t(
				`tournament:staff.role.${staff.role}`,
			)}?`}
			fields={[
				["userId", staff.id],
				["_action", "REMOVE_STAFF"],
			]}
			deleteButtonText="Remove"
		>
			<Button
				variant="minimal-destructive"
				size="tiny"
				data-testid="remove-staff-button"
			>
				<TrashIcon className="build__icon" />
			</Button>
		</FormWithConfirm>
	);
}

function DownloadParticipants() {
	const tournament = useTournament();

	function allParticipantsContent() {
		return tournament.ctx.teams
			.slice()
			.sort((a, b) => a.name.localeCompare(b.name))
			.map((team) => {
				const owner = team.members.find((user) => user.isOwner);
				invariant(owner);

				const nonOwners = team.members.filter((user) => !user.isOwner);

				let result = `-- ${team.name} --\n(C) ${owner.username} (IGN: ${owner.inGameName ?? ""}) - <@${owner.discordId}>`;

				result += nonOwners
					.map(
						(user) =>
							`\n${user.username} (IGN: ${user.inGameName ?? ""}) - <@${user.discordId}>`,
					)
					.join("");

				result += "\n";

				return result;
			})
			.join("\n");
	}

	function checkedInParticipantsContent() {
		const header = "Teams ordered by registration time\n---\n";

		return (
			header +
			tournament.ctx.teams
				.slice()
				.sort((a, b) => a.createdAt - b.createdAt)
				.filter((team) => team.checkIns.length > 0)
				.map((team, i) => {
					return `${i + 1}) ${team.name} - ${databaseTimestampToDate(
						team.createdAt,
					).toISOString()} - ${team.members
						.map((member) => `${member.username} - <@${member.discordId}>`)
						.join(" / ")}`;
				})
				.join("\n")
		);
	}

	function notCheckedInParticipantsContent() {
		return tournament.ctx.teams
			.slice()
			.sort((a, b) => a.name.localeCompare(b.name))
			.filter((team) => team.checkIns.length === 0)
			.map((team) => {
				return `${team.name} - ${team.members
					.map((member) => `${member.username} - <@${member.discordId}>`)
					.join(" / ")}`;
			})
			.join("\n");
	}

	function simpleListInSeededOrder() {
		return tournament.ctx.teams
			.slice()
			.sort(
				(a, b) =>
					(a.seed ?? Number.POSITIVE_INFINITY) -
					(b.seed ?? Number.POSITIVE_INFINITY),
			)
			.filter((team) => team.checkIns.length > 0)
			.map((team) => team.name)
			.join("\n");
	}

	return (
		<div>
			<div className="stack horizontal sm flex-wrap">
				<Button
					size="tiny"
					onClick={() =>
						handleDownload({
							filename: "all-participants.txt",
							content: allParticipantsContent(),
						})
					}
				>
					All participants
				</Button>
				<Button
					size="tiny"
					onClick={() =>
						handleDownload({
							filename: "checked-in-participants.txt",
							content: checkedInParticipantsContent(),
						})
					}
				>
					Checked in participants
				</Button>
				<Button
					size="tiny"
					onClick={() =>
						handleDownload({
							filename: "not-checked-in-participants.txt",
							content: notCheckedInParticipantsContent(),
						})
					}
				>
					Not checked in participants
				</Button>
				<Button
					size="tiny"
					onClick={() =>
						handleDownload({
							filename: "teams-in-seeded-order.txt",
							content: simpleListInSeededOrder(),
						})
					}
				>
					Simple list in seeded order
				</Button>
			</div>
		</div>
	);
}

function handleDownload({
	content,
	filename,
}: {
	content: string;
	filename: string;
}) {
	const element = document.createElement("a");
	const file = new Blob([content], {
		type: "text/plain",
	});
	element.href = URL.createObjectURL(file);
	element.download = filename;
	document.body.appendChild(element);
	element.click();
}

function BracketReset() {
	const tournament = useTournament();
	const fetcher = useFetcher();
	const inProgressBrackets = tournament.brackets.filter((b) => !b.preview);
	const [_bracketToDelete, setBracketToDelete] = React.useState(
		inProgressBrackets[0]?.id,
	);
	const [confirmText, setConfirmText] = React.useState("");

	if (inProgressBrackets.length === 0) {
		return <div className="text-lighter text-sm">No brackets in progress</div>;
	}

	const bracketToDelete = _bracketToDelete ?? inProgressBrackets[0].id;

	const bracketToDeleteName = inProgressBrackets.find(
		(bracket) => bracket.id === bracketToDelete,
	)?.name;

	return (
		<div>
			<fetcher.Form method="post" className="stack horizontal sm items-end">
				<div>
					<label htmlFor="bracket">Bracket</label>
					<select
						id="bracket"
						name="stageId"
						value={bracketToDelete}
						onChange={(e) => setBracketToDelete(Number(e.target.value))}
					>
						{inProgressBrackets.map((bracket) => (
							<option key={bracket.name} value={bracket.id}>
								{bracket.name}
							</option>
						))}
					</select>
				</div>
				<div>
					<label htmlFor="bracket-confirmation">
						Type bracket name (&quot;{bracketToDeleteName}&quot;) to confirm
					</label>
					<Input
						value={confirmText}
						onChange={(e) => setConfirmText(e.target.value)}
						id="bracket-confirmation"
						disableAutoComplete
					/>
				</div>
				<SubmitButton
					_action="RESET_BRACKET"
					state={fetcher.state}
					disabled={confirmText !== bracketToDeleteName}
					testId="reset-bracket-button"
				>
					Reset
				</SubmitButton>
			</fetcher.Form>
			<FormMessage type="error" className="mt-2">
				Resetting a bracket will delete all the match results in it (but not
				other brackets) and reset the bracket to its initial state allowing you
				to change participating teams.
			</FormMessage>
		</div>
	);
}
