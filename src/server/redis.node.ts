type RedisClient = {
	get: (key: string) => Promise<string | null>;
	set: (key: string, value: string, ttlSeconds: number) => Promise<void>;
	del: (key: string) => Promise<void>;
};

const memoryStore = new Map<string, { value: string; expiresAt: number }>();

function createMemoryClient(): RedisClient {
	return {
		async get(key) {
			const entry = memoryStore.get(key);
			if (!entry) return null;
			if (Date.now() > entry.expiresAt) {
				memoryStore.delete(key);
				return null;
			}
			return entry.value;
		},
		async set(key, value, ttlSeconds) {
			memoryStore.set(key, {
				value,
				expiresAt: Date.now() + ttlSeconds * 1000,
			});
		},
		async del(key) {
			memoryStore.delete(key);
		},
	};
}

export function createRedisClient(): RedisClient {
	if (process.env.REDIS_URL) {
		console.warn(
			"[redis] REDIS_URL is set but Node Redis is not configured yet — using in-memory store.",
		);
	} else {
		console.warn(
			"[redis] REDIS_URL is not set — using in-memory auth storage (dev only).",
		);
	}
	return createMemoryClient();
}
