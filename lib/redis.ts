import { Redis as UpstashRedis } from "@upstash/redis";

type RedisLike = {
  get: <T>(key: string) => Promise<T | null>;
  set: (key: string, value: unknown, opts?: { ex?: number }) => Promise<void>;
  del: (key: string) => Promise<void>;
  incr: (key: string) => Promise<number>;
  ping: () => Promise<string>;
};

class MemoryRedis implements RedisLike {
  private store = new Map<string, string>();

  async get<T>(key: string) {
    const raw = this.store.get(key);
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw) as T;
    } catch {
      return raw as T;
    }
  }

  async set(key: string, value: unknown, _opts?: { ex?: number }) {
    this.store.set(key, JSON.stringify(value));
  }

  async del(key: string) {
    this.store.delete(key);
  }

  async incr(key: string) {
    const current = Number((await this.get<number>(key)) ?? 0);
    const next = current + 1;
    await this.set(key, next);
    return next;
  }

  async ping() {
    return "PONG";
  }
}

const memoryRedis = new MemoryRedis();

function createRedisClient(): RedisLike {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (url && token) {
    return new UpstashRedis({ url, token }) as unknown as RedisLike;
  }
  return memoryRedis;
}

export const redis = createRedisClient();
