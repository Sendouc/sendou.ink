import { cachified } from "@epic-web/cachified";
import { type StreamsResponse, type RawStream, streamsSchema } from "./schemas";
import { getToken, purgeCachedToken } from "./token";
import { getTwitchEnvVars } from "./utils";
import { cache } from "~/utils/cache.server";

export async function getStreams() {
  try {
    const result = await cachified({
      key: `twitch-streams`,
      cache,
      // 5 minutes
      ttl: 1000 * 60 * 5,
      // 10 minutes
      staleWhileRevalidate: 1000 * 60 * 5 * 2,
      async getFreshValue() {
        // eslint-disable-next-line no-console
        console.log("getting fresh twitch streams");

        return (await getAllStreams())
          .map(mapRawStream)
          .sort((a, b) => b.viewerCount - a.viewerCount);
      },
    });

    return result;
  } catch (e) {
    console.error(e);
    return [];
  }
}

function mapRawStream(stream: RawStream) {
  return {
    thumbnailUrl: stream.thumbnail_url,
    twitchUserName: stream.user_login,
    viewerCount: stream.viewer_count,
  };
}

const SPLATOON_3_TWITCH_GAME_ID = "1158884259";
async function getAllStreams() {
  const result: RawStream[] = [];

  let cursor: string | undefined = undefined;
  let count = 0;
  while (true) {
    if (count === 50) {
      throw new Error("Stuck getting streams");
    }
    const { data, pagination } = await getStreamsChunk({ cursor });

    result.push(
      // filter to ensure each streamer appears only once
      ...data.filter(
        (stream) =>
          !result.some(
            (existingStream) => existingStream.user_id === stream.user_id,
          ),
      ),
    );
    if (!pagination.cursor) {
      return result;
    }

    cursor = pagination.cursor;
    count++;
  }
}

export async function getStreamsChunk({
  isRetry = false,
  cursor,
}: {
  isRetry?: boolean;
  cursor?: string;
}): Promise<StreamsResponse> {
  const { TWITCH_CLIENT_ID } = getTwitchEnvVars();
  const token = await getToken();

  const res = await fetch(
    `https://api.twitch.tv/helix/streams?game_id=${SPLATOON_3_TWITCH_GAME_ID}&first=100&after=${
      cursor ?? ""
    }`,
    {
      headers: [
        ["Authorization", `Bearer ${token}`],
        ["Client-Id", TWITCH_CLIENT_ID],
      ],
    },
  );

  if (res.status === 401 && !isRetry) {
    purgeCachedToken();
    return getStreamsChunk({ isRetry: true, cursor });
  }

  if (!res.ok) {
    throw new Error(
      `Getting Twitch token failed with status code: ${res.status}`,
    );
  }

  const parsed = streamsSchema.safeParse(await res.json());
  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }

  return parsed.data;
}
