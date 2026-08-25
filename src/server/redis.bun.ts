type RedisClient = {
	get: (key: string) => Promise<string | null>;
	set: (key: string, value: string, ttlSeconds: number) => Promise<void>;
	del: (key: string) => Promise<void>;
};

export function createRedisClient(): RedisClient {
	const client = process.env.REDIS_URL
		? new Bun.RedisClient(process.env.REDIS_URL)
		: new Bun.RedisClient();

	return {
		get: (key) => Promise.resolve(client.get(key)),
		set: async (key, value, ttlSeconds) => {
			await client.set(key, value);
			await client.expire(key, ttlSeconds);
		},
		del: (key) => Promise.resolve(client.del(key)).then(() => undefined),
	};
}
