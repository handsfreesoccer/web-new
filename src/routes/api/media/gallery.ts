import { createFileRoute } from "@tanstack/react-router";
import { StatusCodes } from "http-status-codes";
import "@tanstack/react-start";
import "@tanstack/react-start/server";
import { listGalleryMedia } from "#/server/media";
import { failure, success } from "#/server/response";

export const Route = createFileRoute("/api/media/gallery")({
	server: {
		handlers: {
			GET: async () => {
				try {
					return success(
						await listGalleryMedia(),
						"Gallery media loaded.",
					);
				} catch (error) {
					console.error("[media/gallery]", error);
					return failure(
						"Could not load gallery media.",
						StatusCodes.INTERNAL_SERVER_ERROR,
					);
				}
			},
		},
	},
});
