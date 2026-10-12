import type { Kysely } from "kysely";

/**
 * Each a strict leftmost prefix or an exact duplicate of another index on the same table, ~25MB
 * in all. See `20260821190130-drop-redundant-prefix-indexes` for why that is safe, and why
 * `tournament_match_game_result_participant_match_game_result_id` stays. For the same reason
 * `tournament_team_tournament_id` and `tournament_team_member_tournament_team_id` stay: the
 * tournament reads seek them per team and measured ~8% slower against the wider unique indexes.
 */
const REDUNDANT_INDEXES = [
	// covered by build_weapon_canonical_unique ("buildId", "canonicalWeaponSplId")
	"build_weapon_build_id",
	// covered by sqlite_autoindex_UserResultHighlight_1 ("teamId", "userId")
	"user_result_highlight_team_id",
	// covered by sqlite_autoindex_TrustRelationship_1 ("trustGiverUserId", "trustReceiverUserId")
	"trust_relationship_trust_giver_user_id",
	// covered by sqlite_autoindex_SkillTeamUser_1 ("userId", "skillId")
	"skill_team_user_user_id",
	// covered by sqlite_autoindex_TournamentResult_1 ("userId", "tournamentId")
	"tournament_result_user_id",
	// covered by sqlite_autoindex_GroupLike_1 ("likerGroupId", "targetGroupId")
	"group_like_liker_group_id",
	// covered by sqlite_autoindex_ScrimPostRequestUser_1 ("scrimPostRequestId", "userId")
	"scrim_post_request_user_scrim_post_request_id",
	// covered by sqlite_autoindex_AssociationMember_1 ("userId", "associationId")
	"association_member_user_id",
	// covered by sqlite_autoindex_UserWidget_1 ("userId", "index")
	"user_widget_user_id",
	// covered by sqlite_autoindex_TournamentLFGLike_1 ("likerTeamId", "targetTeamId")
	"tournament_lfg_like_liker_team_id",
	// covered by sqlite_autoindex_TournamentMatchPickBanEvent_1 ("matchId", "number")
	"pick_ban_event_match_id",
	// duplicate of sqlite_autoindex_ScrimMap_1 ("scrimPostId", "index")
	"scrim_map_scrim_post_id_index_idx",
	// covered by sqlite_autoindex_UserReport_1 ("reportedUserId", "reporterUserId")
	"user_report_reported_user_id_idx",
	// covered by sqlite_autoindex_Friendship_1 ("userOneId", "userTwoId")
	"friendship_user_one_id",
	// duplicate of sqlite_autoindex_GroupMatch_1 ("alphaGroupId")
	"group_match_alpha_group_id",
	// duplicate of sqlite_autoindex_GroupMatch_2 ("bravoGroupId")
	"group_match_bravo_group_id",
	// covered by sqlite_autoindex_GroupMatchContinueVote_1 ("groupId", "userId")
	"group_match_continue_vote_group_id",
	// covered by sqlite_autoindex_LFGPost_1 ("authorId", "type")
	"lfg_post_author_id",
	// covered by sqlite_autoindex_MapPoolMap_1 ("calendarEventId", "stageId", "mode")
	"map_pool_map_calendar_event_id",
	// covered by sqlite_autoindex_SavedCalendarEvent_1 ("userId", "calendarEventId")
	"saved_calendar_event_user_id",
	// covered by sqlite_autoindex_ScrimPostRequest_1 ("scrimPostId", "teamId")
	"scrim_post_request_scrim_post_id",
	// duplicate of sqlite_autoindex_SplatoonPlayer_1 ("userId")
	"splatoon_player_user_id",
	// covered by sqlite_autoindex_TournamentMatchScheduleProposal_1 ("matchId", "tournamentTeamId", "proposedAt")
	"tournament_match_schedule_proposal_match_id",
	// duplicate of sqlite_autoindex_TournamentOrganization_1 ("slug")
	"tournament_organization_slug",
	// covered by xrank_placement_player_power ("playerId", "power", "mode", "weaponSplId", "name")
	"splatoon_placement_player_id",
];

export async function up(db: Kysely<any>): Promise<void> {
	await db.transaction().execute(async (trx) => {
		// lets the participated users read probe roster members instead of every participant row of the tournament
		await trx.schema.dropIndex("idx_tmgrp_tournament_team_id").execute();
		await trx.schema
			.createIndex("tournament_match_game_result_participant_team_id_user_id")
			.on("TournamentMatchGameResultParticipant")
			.columns(["tournamentTeamId", "userId"])
			.execute();

		for (const indexName of REDUNDANT_INDEXES) {
			await trx.schema.dropIndex(indexName).execute();
		}
	});
}
