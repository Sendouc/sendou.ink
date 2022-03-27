import Redis from "ioredis";

let redis: Redis;

declare global {
  // eslint-disable-next-line no-var
  var __redis: Redis | undefined;
}

// this is needed because in development we don't want to restart
// the server with every change, but we want to make sure we don't
// create a new connection to the Redis with every change either.
if (process.env.NODE_ENV === "production" && process.env.REDIS_URL) {
  redis = new Redis(process.env.REDIS_URL);
} else if (process.env.REDIS_URL) {
  if (!global.__redis) {
    global.__redis = new Redis(process.env.REDIS_URL);
  }
  redis = global.__redis;
}

export async function cached<T>({
  secondsToExpire,
  call,
  key,
}: {
  key: string;
  call: () => Promise<T>;
  secondsToExpire: number;
}) {
  if (!redis) return call();

  const fromRedis = await redis.get(key);
  if (fromRedis) return JSON.parse(fromRedis) as T;

  const result = await call();
  await redis.set(key, JSON.stringify(result), "EX", secondsToExpire);

  return result;
}
