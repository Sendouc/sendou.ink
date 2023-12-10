import cachified from "@epic-web/cachified";
import { HALF_HOUR_IN_MS } from "~/constants";
import {
  type UserLeaderboardWithAdditionsItem,
  cachedFullUserLeaderboard,
} from "~/features/leaderboards/core/leaderboards.server";
import { currentOrPreviousSeason } from "~/features/mmr/season";
import * as QStreamsRepository from "~/features/sendouq-streams/QStreamsRepository.server";
import { getStreams } from "~/modules/twitch";
import type { MappedStream } from "~/modules/twitch/streams";
import { cache, ttl } from "~/utils/cache.server";
import { SENDOUQ_STREAMS_KEY } from "../q-streams-constants";

export function cachedStreams() {
  const season = currentOrPreviousSeason(new Date())!;

  return cachified({
    key: SENDOUQ_STREAMS_KEY,
    cache: cache,
    ttl: ttl(HALF_HOUR_IN_MS),
    async getFreshValue() {
      return streamedMatches({
        matchPlayers: await QStreamsRepository.activeMatchPlayers(),
        streams: await getStreams(),
        leaderboard: await cachedFullUserLeaderboard(season.nth),
      });
    },
  });
}

function streamedMatches({
  matchPlayers,
  streams,
  leaderboard,
}: {
  matchPlayers: QStreamsRepository.ActiveMatchPlayersItem[];
  streams: MappedStream[];
  leaderboard: UserLeaderboardWithAdditionsItem[];
}) {
  return matchPlayers.flatMap((player) => {
    const stream = streams.find(
      (stream) => stream.twitchUserName === player.user?.twitch,
    );

    if (!stream) {
      return [];
    }

    const leaderboardEntry = leaderboard.find(
      (entry) => entry.id === player.user?.id,
    );

    return {
      stream,
      match: {
        id: player.groupMatchId,
        createdAt: player.groupMatchCreatedAt,
      },
      user: {
        ...player.user!,
        twitch: player.user!.twitch!,
      },
      weaponSplId: leaderboardEntry?.weaponSplId,
      tier: leaderboardEntry?.tier,
    };
  });
}
