import { type Kysely, sql } from "kysely";

type LegacyCastEntry = { twitchAccount: string; matchId: number };

/**
 * Streams are identified by platform + account instead of a Twitch account so other platforms can be
 * added.
 */
export async function up(db: Kysely<any>): Promise<void> {
	await db.transaction().execute(async (trx) => {
		// live YouTube streams are matched to users by it, like Twitch ones by "user_twitch"
		await trx.schema
			.createIndex("user_youtube_id")
			.on("User")
			.column("youtubeId")
			.execute();

		// fully replaced on every sync so nothing to carry over
		await trx.schema.dropTable("LiveStream").execute();
		await trx.schema
			.createTable("LiveStream")
			.addColumn("id", "integer", (col) => col.primaryKey().autoIncrement())
			.addColumn("platform", "text", (col) => col.notNull())
			.addColumn("account", "text", (col) => col.notNull())
			.addColumn("videoId", "text")
			.addColumn("userId", "integer", (col) =>
				col.references("User.id").onDelete("cascade"),
			)
			.addColumn("viewerCount", "integer", (col) => col.notNull())
			.addColumn("thumbnailUrl", "text", (col) => col.notNull())
			.addUniqueConstraint("live_stream_platform_account", [
				"platform",
				"account",
			])
			.modifyEnd(sql`strict`)
			.execute();
		await trx.schema
			.createIndex("live_stream_user_id")
			.on("LiveStream")
			.column("userId")
			.where("userId", "is not", null)
			.execute();

		await trx.schema
			.createTable("TournamentStreamer_new")
			.addColumn("id", "integer", (col) => col.primaryKey().autoIncrement())
			.addColumn("userId", "integer", (col) =>
				col.references("User.id").onDelete("set null"),
			)
			.addColumn("tournamentId", "integer", (col) =>
				col.notNull().references("Tournament.id").onDelete("cascade"),
			)
			.addColumn("platform", "text", (col) => col.notNull())
			.addColumn("account", "text", (col) => col.notNull())
			.addUniqueConstraint("tournament_streamer_platform_account_tournament", [
				"platform",
				"account",
				"tournamentId",
			])
			.modifyEnd(sql`strict`)
			.execute();
		await sql`
			insert into "TournamentStreamer_new" ("id", "userId", "tournamentId", "platform", "account")
			select "id", "userId", "tournamentId", 'TWITCH', "twitchAccount" from "TournamentStreamer"
		`.execute(trx);
		await trx.schema.dropTable("TournamentStreamer").execute();
		await trx.schema
			.alterTable("TournamentStreamer_new")
			.renameTo("TournamentStreamer")
			.execute();
		await trx.schema
			.createIndex("tournament_streamer_tournament_id")
			.on("TournamentStreamer")
			.column("tournamentId")
			.execute();
		await trx.schema
			.createIndex("tournament_streamer_user_id")
			.on("TournamentStreamer")
			.column("userId")
			.where("userId", "is not", null)
			.execute();

		await trx.schema
			.alterTable("Tournament")
			.addColumn("castAccounts", "text")
			.execute();
		await sql`
			update "Tournament"
			set "castAccounts" = (
				select json_group_array(json_object('platform', 'TWITCH', 'account', "value", 'name', "value"))
				from json_each("Tournament"."castTwitchAccounts")
			)
			where "castTwitchAccounts" is not null
		`.execute(trx);
		await trx.schema
			.alterTable("Tournament")
			.dropColumn("castTwitchAccounts")
			.execute();

		const tournaments = await sql<{ id: number; castedMatchesInfo: string }>`
			select "id", "castedMatchesInfo" from "Tournament"
			where "castedMatchesInfo" is not null
		`.execute(trx);

		for (const tournament of tournaments.rows) {
			const info = JSON.parse(tournament.castedMatchesInfo);

			await sql`
				update "Tournament"
				set "castedMatchesInfo" = ${JSON.stringify({
					lockedMatches: info.lockedMatches.map(toPlatformEntry),
					castedMatches: info.castedMatches.map(toPlatformEntry),
					castedMatchHistory: info.castedMatchHistory?.map(toPlatformEntry),
				})}
				where "id" = ${tournament.id}
			`.execute(trx);
		}
	});
}

function toPlatformEntry<T extends LegacyCastEntry>({
	twitchAccount,
	...rest
}: T) {
	return { ...rest, platform: "TWITCH", account: twitchAccount };
}
