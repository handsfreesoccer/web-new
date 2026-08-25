import { createFileRoute } from "@tanstack/react-router";
import { StatusCodes } from "http-status-codes";
import "@tanstack/react-start";
import "@tanstack/react-start/server";
import { processDueEmails } from "#/server/cron";
import { failure, success } from "#/server/response";

export const Route = createFileRoute("/api/cron/daily")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				if (
					process.env.CRON_SECRET &&
					request.headers.get("authorization") !==
						`Bearer ${process.env.CRON_SECRET}`
				)
					return failure("Unauthorized", StatusCodes.UNAUTHORIZED);
				return success(await processDueEmails(), "Due emails processed.");
			},
		},
	},
});
