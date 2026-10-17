import type { AuthenticatedUser } from "~/features/auth/core/user.server";
import * as ChatSystemMessage from "~/features/chat/ChatSystemMessage.server";
import * as ShowcaseTournaments from "~/features/front-page/core/ShowcaseTournaments.server";
import { notify } from "~/features/notifications/core/notify.server";
import { resolveNotifications } from "~/features/notifications/core/resolve.server";
import type { Tournament } from "~/features/tournament-bracket/core/Tournament";
import {
	clearTournamentDataCache,
	requireTournamentOrganizer,
	tournamentFromParams,
	tournamentTeamsFullCached,
} from "~/features/tournament-bracket/core/Tournament.server";
import { requireNotBannedByOrganization } from "~/features/tournament/tournament-utils.server";
import { defineAction } from "~/form/define-action.server";
import { errorToastIfFalsy } from "~/utils/remix.server";
import { assertUnreachable } from "~/utils/types";
import { lookingSchema } from "../tournament-lfg-schemas";
import { survivingTeamId } from "../tournament-lfg-utils";
import { pickupChatRoomExpiresAt } from "../tournament-lfg-utils.server";
import * as TournamentLFGRepository from "../TournamentLFGRepository.server";

export const action = defineAction(
	{ body: lookingSchema },
	async ({ params, body }) => {
		const { tournament, tournamentId, user } = await tournamentFromParams(
			params,
			{ for: "action" },
		);

		const findOwnGroup = async () => {
			const groups =
				await TournamentLFGRepository.findLookingTeamsByTournamentId(
					tournamentId,
				);
			return groups.find((g) => g.members.some((m) => m.id === user.id));
		};

		switch (body._action) {
			case "JOIN_QUEUE": {
				const existingGroup = await findOwnGroup();
				if (existingGroup) return null;

				await requireNotBannedByOrganization({ tournament, user });
				errorToastIfFalsy(
					tournament.canAddNewSubPost,
					"Cannot add sub post at this time",
				);
				const team = tournament.teamMemberOfByUser(user);

				if (team) {
					await startLookingAsTeam({ tournament, tournamentId, user, team });
				} else {
					await TournamentLFGRepository.insertPlaceholderTeam({
						tournamentId,
						userId: user.id,
						isStayAsSub: body.stayAsSub ?? false,
						lfgNote: body.note ?? undefined,
					});
				}

				break;
			}
			case "LIKE": {
				const groups =
					await TournamentLFGRepository.findLookingTeamsByTournamentId(
						tournamentId,
					);
				const ownGroup = groups.find((g) =>
					g.members.some((m) => m.id === user.id),
				);
				if (!ownGroup || !isGroupManager(ownGroup, user.id)) return null;

				const targetGroup = groups.find((g) => g.id === body.targetTeamId);
				if (!targetGroup) return null;

				await TournamentLFGRepository.insertLike({
					likerTeamId: ownGroup.id,
					targetTeamId: body.targetTeamId,
				});

				void notify({
					userIds: targetGroup.members.map((m) => m.id),
					notification: {
						type: "TO_LIKE_RECEIVED",
						meta: {
							tournamentId,
							tournamentName: tournament.ctx.name,
							likerUsername: user.username,
						},
						pictureUrl: tournament.ctx.logoUrl,
					},
				});

				break;
			}
			case "UNLIKE": {
				const ownGroup = await findOwnGroup();
				if (!ownGroup || !isGroupManager(ownGroup, user.id)) return null;

				await TournamentLFGRepository.deleteLike({
					likerTeamId: ownGroup.id,
					targetTeamId: body.targetTeamId,
				});

				break;
			}
			case "ACCEPT": {
				const merged = await acceptLike({
					tournament,
					tournamentId,
					user,
					targetTeamId: body.targetTeamId,
				});
				if (!merged) return null;

				break;
			}
			case "GIVE_MANAGER": {
				const ownGroup = await findOwnGroup();
				errorToastIfFalsy(
					ownGroup && isGroupOwner(ownGroup, user.id),
					"Not owner",
				);

				await TournamentLFGRepository.updateMemberRole({
					teamId: ownGroup.id,
					userId: body.userId,
					role: "MANAGER",
				});

				break;
			}
			case "REMOVE_MANAGER": {
				const ownGroup = await findOwnGroup();
				errorToastIfFalsy(
					ownGroup && isGroupOwner(ownGroup, user.id),
					"Not owner",
				);

				await TournamentLFGRepository.updateMemberRole({
					teamId: ownGroup.id,
					userId: body.userId,
					role: "REGULAR",
				});

				break;
			}
			case "UPDATE_GROUP": {
				const ownGroup = await findOwnGroup();
				if (!ownGroup) return null;

				await TournamentLFGRepository.updateTeamNote({
					teamId: ownGroup.id,
					value: body.note ?? null,
				});

				break;
			}
			case "SET_STAY_AS_SUB": {
				const ownGroup = await findOwnGroup();
				if (!ownGroup) return null;

				await TournamentLFGRepository.updateOwnStayAsSub({
					teamId: ownGroup.id,
					value: body.stayAsSub,
				});

				break;
			}
			case "LEAVE_GROUP": {
				ChatSystemMessage.notifyRoomsChanged(
					await TournamentLFGRepository.leaveLfg({
						userId: user.id,
						tournamentId,
					}),
				);

				break;
			}
			case "DELETE_GROUP": {
				requireTournamentOrganizer(
					tournament,
					user,
					"Only tournament organizers can remove other groups",
				);

				ChatSystemMessage.notifyRoomsChanged(
					await TournamentLFGRepository.leaveLfg({
						userId: body.userId,
						tournamentId,
					}),
				);

				break;
			}
			case "ADD_SUB": {
				await requireNotBannedByOrganization({ tournament, user });
				errorToastIfFalsy(!tournament.everyBracketOver, "Tournament is over");
				errorToastIfFalsy(
					tournament.canAddNewSubPost,
					"Cannot add sub post at this time",
				);

				const team = tournament.teamMemberOfByUser(user);
				errorToastIfFalsy(!team, "Already on a team");

				const existingSubGroups =
					await TournamentLFGRepository.findSubGroups(tournamentId);
				const hasExistingSubPost = existingSubGroups.some((g) =>
					g.members.some((m) => m.id === user.id),
				);
				errorToastIfFalsy(!hasExistingSubPost, "Already have a sub post");

				await TournamentLFGRepository.insertPlaceholderTeam({
					tournamentId,
					userId: user.id,
					isStayAsSub: true,
					lfgNote: body.message ?? undefined,
				});

				break;
			}
			case "ADD_SUB_FOR_USER": {
				requireTournamentOrganizer(
					tournament,
					user,
					"Only tournament organizers can add subs for other users",
				);
				errorToastIfFalsy(
					tournament.canAddNewSubPostAsOrganizer,
					"Cannot add sub post at this time",
				);
				await requireNotBannedByOrganization({
					tournament,
					user: { id: body.userId },
					message: "The user is banned from events hosted by this organization",
				});

				const targetTeam = tournament.teamMemberOfByUser({ id: body.userId });
				errorToastIfFalsy(
					!targetTeam || targetTeam.droppedOut,
					"User is already on a team",
				);

				const existingSubGroups =
					await TournamentLFGRepository.findSubGroups(tournamentId);
				errorToastIfFalsy(
					!existingSubGroups.some((g) =>
						g.members.some((m) => m.id === body.userId),
					),
					"User already has a sub post",
				);

				await TournamentLFGRepository.insertPlaceholderTeam({
					tournamentId,
					userId: body.userId,
					isStayAsSub: true,
					lfgNote: body.message ?? undefined,
				});

				break;
			}
			case "DELETE_SUB": {
				errorToastIfFalsy(
					user.id === body.userId || tournament.isOrganizer(user),
					"You can only delete your own sub post",
				);

				ChatSystemMessage.notifyRoomsChanged(
					await TournamentLFGRepository.leaveLfg({
						userId: body.userId,
						tournamentId,
					}),
				);

				break;
			}
			default: {
				assertUnreachable(body);
			}
		}

		clearTournamentDataCache(tournamentId);

		return null;
	},
);

type LookingGroup = Awaited<
	ReturnType<typeof TournamentLFGRepository.findLookingTeamsByTournamentId>
>[number];

function isGroupManager(group: LookingGroup | undefined, userId: number) {
	const member = group?.members.find((m) => m.id === userId);
	return member?.role === "OWNER" || member?.role === "MANAGER";
}

function isGroupOwner(group: LookingGroup | undefined, userId: number) {
	const member = group?.members.find((m) => m.id === userId);
	return member?.role === "OWNER";
}

async function startLookingAsTeam({
	tournament,
	tournamentId,
	user,
	team,
}: {
	tournament: Tournament;
	tournamentId: number;
	user: AuthenticatedUser;
	team: NonNullable<ReturnType<Tournament["teamMemberOfByUser"]>>;
}) {
	const teams = await tournamentTeamsFullCached({ tournamentId, user });
	const member = teams
		.find((t) => t.id === team.id)
		?.members.find((m) => m.userId === user.id);
	const canManageTeam = member?.role === "OWNER" || member?.role === "MANAGER";
	errorToastIfFalsy(
		canManageTeam,
		"Only team owners and managers can join the queue",
	);

	errorToastIfFalsy(
		team.memberUserIds.length < tournament.maxMembersPerTeam,
		"Team is already at max capacity",
	);
	const roomsChangedUserIds = await TournamentLFGRepository.startLooking({
		teamId: team.id,
		chatRoomExpiresAt: pickupChatRoomExpiresAt(tournament.ctx.startsAt),
	});
	ChatSystemMessage.notifyRoomsChanged(roomsChangedUserIds);
}

/** Merges the viewer's group with the group that liked it. False when there is nothing to accept. */
async function acceptLike({
	tournament,
	tournamentId,
	user,
	targetTeamId,
}: {
	tournament: Tournament;
	tournamentId: number;
	user: AuthenticatedUser;
	targetTeamId: number;
}) {
	const groups =
		await TournamentLFGRepository.findLookingTeamsByTournamentId(tournamentId);
	const ownGroup = groups.find((g) => g.members.some((m) => m.id === user.id));
	if (!ownGroup || !isGroupManager(ownGroup, user.id)) return false;

	const theirGroup = groups.find((g) => g.id === targetTeamId);
	if (!theirGroup) return false;

	const theirLikes =
		await TournamentLFGRepository.findAllLikesByTeamId(targetTeamId);
	if (!theirLikes.given.some((like) => like.teamId === ownGroup.id)) {
		return false;
	}

	const surviving = survivingTeamId({
		ourGroup: {
			id: ownGroup.id,
			isPlaceholder: Boolean(ownGroup.isPlaceholder),
			teamName: null,
			teamAvatarUrl: null,
			note: null,
			members: [],
			usersRole: null,
		},
		theirGroup: {
			id: theirGroup.id,
			isPlaceholder: Boolean(theirGroup.isPlaceholder),
			teamName: null,
			teamAvatarUrl: null,
			note: null,
			members: [],
			usersRole: null,
		},
	});

	const otherGroup = surviving === ownGroup.id ? theirGroup : ownGroup;

	const roomsChangedUserIds = await TournamentLFGRepository.mergeTeams({
		survivingTeamId: surviving,
		otherTeamId: otherGroup.id,
		maxGroupSize: tournament.maxMembersPerTeam,
		chatRoomExpiresAt: pickupChatRoomExpiresAt(tournament.ctx.startsAt),
	});
	ChatSystemMessage.notifyRoomsChanged(roomsChangedUserIds);

	await ShowcaseTournaments.refreshCachedTournamentCounts(tournamentId);

	void notify({
		userIds: theirGroup.members.map((m) => m.id),
		notification: {
			type: "TO_LIKE_ACCEPTED",
			meta: {
				tournamentId,
				tournamentName: tournament.ctx.name,
				accepterUsername: user.username,
			},
			pictureUrl: tournament.ctx.logoUrl,
		},
	});

	await resolveNotifications({
		userIds: ownGroup.members.map((m) => m.id),
		type: "TO_LIKE_RECEIVED",
		meta: { tournamentId },
	});

	return true;
}
