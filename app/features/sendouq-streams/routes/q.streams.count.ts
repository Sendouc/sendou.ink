import { cachedStreams } from "../core/streams.server";

export type StreamsCountLoader = typeof loader;

export const loader = async () => {
  return {
    count: (await cachedStreams()).length,
  };
};
