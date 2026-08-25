const client = process.env.REDIS_URL
	? new Bun.RedisClient(process.env.REDIS_URL)
	: new Bun.RedisClient();

export const redis = {
	get: (key: string) => client.get(key),
	set: async (key: string, value: string, ttlSeconds: number) => {
		await client.set(key, value);
		await client.expire(key, ttlSeconds);
	},
	del: (key: string) => client.del(key),
};

export const redisKeys = {
	magicLink: (token: string) => `hfs:auth:magic-link:${token}`,
	refreshToken: (tokenHash: string) => `hfs:auth:refresh:${tokenHash}`,
};
