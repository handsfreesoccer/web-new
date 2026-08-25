import { createFileRoute } from "@tanstack/react-router";
import { StatusCodes } from "http-status-codes";
import "@tanstack/react-start";
import "@tanstack/react-start/server";
import { refreshSession, REFRESH_COOKIE } from "#/server/auth";
import { failure, success } from "#/server/response";

export const Route = createFileRoute("/api/admin/auth/refresh")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				const token = request.headers
					.get("cookie")
					?.match(new RegExp(`${REFRESH_COOKIE}=([^;]+)`))?.[1];
				const session = token ? await refreshSession(token) : null;
				if (!session)
					return failure(
						"Refresh token is invalid or expired.",
						StatusCodes.UNAUTHORIZED,
					);
				return success(
					{ accessToken: session.accessToken },
					"Access token refreshed.",
				);
			},
		},
	},
});
