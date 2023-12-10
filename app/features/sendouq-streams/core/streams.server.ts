import cachified from "@epic-web/cachified";
import { HALF_HOUR_IN_MS } from "~/constants";
import * as QStreamsRepository from "~/features/sendouq-streams/QStreamsRepository.server";
import { getStreams } from "~/modules/twitch";
import { cache, ttl } from "~/utils/cache.server";
import { SENDOUQ_STREAMS_KEY } from "../q-streams-constants";
import type { MappedStream } from "~/modules/twitch/streams";

export function cachedStreams() {
  return cachified({
    key: SENDOUQ_STREAMS_KEY,
    cache: cache,
    ttl: ttl(HALF_HOUR_IN_MS),
    async getFreshValue() {
      return streamedMatches({
        matchPlayers: await QStreamsRepository.activeMatchPlayers(),
        streams: await getStreams(),
      });
    },
  });
}

function streamedMatches({
  matchPlayers,
  streams,
}: {
  matchPlayers: QStreamsRepository.ActiveMatchPlayersItem[];
  streams: MappedStream[];
}) {
  return matchPlayers.flatMap((player) => {
    const stream = streams.find(
      (stream) => stream.twitchUserName === player.user?.twitch,
    );

    if (!stream) {
      return [];
    }

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
    };
  });
}
