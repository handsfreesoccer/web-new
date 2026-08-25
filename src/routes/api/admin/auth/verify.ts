import { createFileRoute } from "@tanstack/react-router";
import { StatusCodes } from "http-status-codes";
import "@tanstack/react-start";
import "@tanstack/react-start/server";
import { consumeMagicLink, refreshCookie } from "#/server/auth";
import { failure } from "#/server/response";

export const Route = createFileRoute("/api/admin/auth/verify")({
	server: {
		handlers: {
			GET: async ({ request }) => {
				const token = new URL(request.url).searchParams.get("token");
				const session = token ? await consumeMagicLink(token) : null;
				if (!session)
					return failure(
						"This magic link is invalid or expired.",
						StatusCodes.UNAUTHORIZED,
					);
				return new Response(
					JSON.stringify({
						success: true,
						message: "Signed in.",
						data: { accessToken: session.accessToken },
					}),
					{
						headers: {
							"Content-Type": "application/json",
							"Set-Cookie": refreshCookie(
								session.refreshToken,
								session.expiresAt,
							),
						},
					},
				);
			},
		},
	},
});
