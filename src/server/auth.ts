import { createHash, randomBytes } from "node:crypto";
import { jwtVerify, SignJWT } from "jose";
import { redis, redisKeys } from "#/server/redis";

export const ADMIN_EMAIL = "handsfreesoccer@gmail.com";
const secret = new TextEncoder().encode(
	process.env.AUTH_SECRET ?? "hands-free-soccer-development-secret",
);
export const REFRESH_COOKIE = "hfs_refresh_token";
export const hashToken = (value: string) =>
	createHash("sha256").update(value).digest("hex");

export async function issueAdminMagicLink() {
	const token = randomBytes(32).toString("hex");
	await redis.set(redisKeys.magicLink(token), ADMIN_EMAIL, 15 * 60);
	return `${process.env.APP_URL ?? "http://localhost:5173"}/admin/login?token=${token}`;
}

export async function consumeMagicLink(token: string) {
	if ((await redis.get(redisKeys.magicLink(token))) !== ADMIN_EMAIL)
		return null;
	await redis.del(redisKeys.magicLink(token));
	return createSession();
}

export async function createSession() {
	const refreshToken = randomBytes(48).toString("hex");
	const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
	await redis.set(
		redisKeys.refreshToken(hashToken(refreshToken)),
		ADMIN_EMAIL,
		30 * 24 * 60 * 60,
	);
	return { refreshToken, accessToken: await createAccessToken(), expiresAt };
}

export async function refreshSession(refreshToken: string) {
	if (
		(await redis.get(redisKeys.refreshToken(hashToken(refreshToken)))) !==
		ADMIN_EMAIL
	)
		return null;
	return {
		accessToken: await createAccessToken(),
		expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
	};
}

export async function revokeRefreshToken(refreshToken: string) {
	await redis.del(redisKeys.refreshToken(hashToken(refreshToken)));
}

export async function verifyAccessToken(token: string) {
	try {
		const result = await jwtVerify(token, secret);
		return result.payload.email === ADMIN_EMAIL;
	} catch {
		return false;
	}
}

async function createAccessToken() {
	return new SignJWT({ email: ADMIN_EMAIL, role: "admin" })
		.setProtectedHeader({ alg: "HS256" })
		.setSubject(ADMIN_EMAIL)
		.setIssuedAt()
		.setExpirationTime("1d")
		.sign(secret);
}

export const refreshCookie = (value: string, expires: Date) =>
	`${REFRESH_COOKIE}=${value}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${Math.floor((expires.getTime() - Date.now()) / 1000)}${process.env.NODE_ENV === "production" ? "; Secure" : ""}`;
export const clearRefreshCookie = `${REFRESH_COOKIE}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`;
