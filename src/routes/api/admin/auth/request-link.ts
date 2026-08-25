import { createFileRoute } from "@tanstack/react-router";
import { StatusCodes } from "http-status-codes";
import "@tanstack/react-start";
import "@tanstack/react-start/server";
import { ADMIN_EMAIL, issueAdminMagicLink } from "#/server/auth";
import { sendAdminMagicLink } from "#/server/email";
import { failure, jsonBody, success } from "#/server/response";

export const Route = createFileRoute("/api/admin/auth/request-link")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				const body = await jsonBody<{ email?: string }>(request);
				if (body.error) return body.error;
				if (body.value.email?.trim().toLowerCase() !== ADMIN_EMAIL)
					return failure(
						"This email is not authorized.",
						StatusCodes.FORBIDDEN,
					);
				const magicLink = await issueAdminMagicLink();
				await sendAdminMagicLink(ADMIN_EMAIL, magicLink.link);
				return success(
					{
						...(process.env.NODE_ENV === "development"
							? { previewCode: magicLink.code, previewUrl: magicLink.link }
							: {}),
					},
					"If authorized, a magic code has been sent.",
				);
			},
		},
	},
});
