type RedisClient = {
	get: (key: string) => Promise<string | null>;
	set: (key: string, value: string, ttlSeconds: number) => Promise<void>;
	del: (key: string) => Promise<void>;
};

let clientPromise: Promise<RedisClient> | undefined;

async function loadClient() {
	if (typeof (globalThis as { Bun?: unknown }).Bun !== "undefined") {
		return (await import("./redis.bun.js")).createRedisClient();
	}
	return (await import("./redis.node.js")).createRedisClient();
}

function getClient() {
	clientPromise ??= loadClient();
	return clientPromise;
}

export const redis = {
	get: (key: string) => getClient().then((client) => client.get(key)),
	set: (key: string, value: string, ttlSeconds: number) =>
		getClient().then((client) => client.set(key, value, ttlSeconds)),
	del: (key: string) => getClient().then((client) => client.del(key)),
};

export const redisKeys = {
	magicLink: (token: string) => `hfs:auth:magic-link:${token}`,
	refreshToken: (tokenHash: string) => `hfs:auth:refresh:${tokenHash}`,
};
