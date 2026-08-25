import { createFileRoute } from "@tanstack/react-router";
import { StatusCodes } from "http-status-codes";
import "@tanstack/react-start";
import "@tanstack/react-start/server";
import { ZodError } from "zod";
import { createBooking } from "#/server/booking";
import { failure, jsonBody, success } from "#/server/response";

export const Route = createFileRoute("/api/bookings")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				const body = await jsonBody<Record<string, unknown>>(request);
				if (body.error) return body.error;
				try {
					return success(
						await createBooking(body.value),
						"Booking submitted successfully.",
						StatusCodes.CREATED,
					);
				} catch (error) {
					if (error instanceof ZodError)
						return failure(
							"Please correct the highlighted fields.",
							StatusCodes.UNPROCESSABLE_ENTITY,
							error.issues.map((issue) => issue.message),
						);
					if (error instanceof Error)
						return failure(
							error.message,
							StatusCodes.UNPROCESSABLE_ENTITY,
						);
					return failure(
						"We could not save your booking right now.",
						StatusCodes.INTERNAL_SERVER_ERROR,
					);
				}
			},
		},
	},
});
