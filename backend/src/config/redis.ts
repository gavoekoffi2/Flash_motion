import { env } from "./env";

export const redisConnection = {
  url: env.redisUrl,
};

// BullMQ connection options parsed from URL
export function getRedisOpts() {
  const url = new URL(env.redisUrl);
  return {
    host: url.hostname,
    port: parseInt(url.port || "6379", 10),
    password: url.password || undefined,
  };
}
