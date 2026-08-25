import { createHash, randomBytes } from "node:crypto";
import { jwtVerify, SignJWT } from "jose";
import { prisma } from "#/db";

export const ADMIN_EMAIL = "handsfreesoccer@gmail.com";
const secret = new TextEncoder().encode(
	process.env.AUTH_SECRET ?? "hands-free-soccer-development-secret",
);
export const REFRESH_COOKIE = "hfs_refresh_token";
export const hashToken = (value: string) =>
	createHash("sha256").update(value).digest("hex");

export async function issueAdminMagicLink() {
	const token = randomBytes(32).toString("hex");
	await prisma.adminMagicLink.create({
		data: {
			email: ADMIN_EMAIL,
			tokenHash: hashToken(token),
			expiresAt: new Date(Date.now() + 15 * 60 * 1000),
		},
	});
	return `${process.env.APP_URL ?? "http://localhost:5173"}/admin/login?token=${token}`;
}

export async function consumeMagicLink(token: string) {
	const link = await prisma.adminMagicLink.findFirst({
		where: {
			tokenHash: hashToken(token),
			email: ADMIN_EMAIL,
			usedAt: null,
			expiresAt: { gt: new Date() },
		},
	});
	if (!link) return null;
	await prisma.adminMagicLink.update({
		where: { id: link.id },
		data: { usedAt: new Date() },
	});
	return createSession();
}

export async function createSession() {
	const refreshToken = randomBytes(48).toString("hex");
	const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
	await prisma.adminSession.create({
		data: {
			email: ADMIN_EMAIL,
			refreshTokenHash: hashToken(refreshToken),
			expiresAt,
		},
	});
	return { refreshToken, accessToken: await createAccessToken(), expiresAt };
}

export async function refreshSession(refreshToken: string) {
	const session = await prisma.adminSession.findFirst({
		where: {
			refreshTokenHash: hashToken(refreshToken),
			email: ADMIN_EMAIL,
			expiresAt: { gt: new Date() },
		},
	});
	if (!session) return null;
	return {
		accessToken: await createAccessToken(),
		expiresAt: session.expiresAt,
	};
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
