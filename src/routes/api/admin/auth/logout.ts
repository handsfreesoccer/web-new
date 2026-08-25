import { createFileRoute } from "@tanstack/react-router";
import "@tanstack/react-start";
import "@tanstack/react-start/server";
import { clearRefreshCookie, hashToken, REFRESH_COOKIE } from "#/server/auth";
import { prisma } from "#/db";

export const Route = createFileRoute("/api/admin/auth/logout")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				const token = request.headers
					.get("cookie")
					?.match(new RegExp(`${REFRESH_COOKIE}=([^;]+)`))?.[1];
				if (token)
					await prisma.adminSession.deleteMany({
						where: { refreshTokenHash: hashToken(token) },
					});
				return new Response(
					JSON.stringify({ success: true, message: "Signed out.", data: {} }),
					{
						headers: {
							"Content-Type": "application/json",
							"Set-Cookie": clearRefreshCookie,
						},
					},
				);
			},
		},
	},
});
