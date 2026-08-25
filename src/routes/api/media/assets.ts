import { createFileRoute } from "@tanstack/react-router";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";
import "@tanstack/react-start";
import "@tanstack/react-start/server";
import { listSiteAssets } from "#/server/media";
import { failure, success } from "#/server/response";

const querySchema = z.object({
	prefix: z
		.string()
		.min(1)
		.max(120)
		.regex(/^[a-z0-9/-]+$/i, "Prefix must use letters, numbers, /, or -."),
});

export const Route = createFileRoute("/api/media/assets")({
	server: {
		handlers: {
			GET: async ({ request }) => {
				const params = Object.fromEntries(new URL(request.url).searchParams);
				const parsed = querySchema.safeParse(params);
				if (!parsed.success) {
					return failure(
						"Provide a valid assets prefix.",
						StatusCodes.BAD_REQUEST,
						parsed.error.issues.map((issue) => issue.message),
					);
				}

				try {
					return success(
						await listSiteAssets(parsed.data.prefix),
						"Site assets loaded.",
					);
				} catch (error) {
					console.error("[media/assets]", error);
					return failure(
						"Could not load site assets.",
						StatusCodes.INTERNAL_SERVER_ERROR,
					);
				}
			},
		},
	},
});
