import { createFileRoute } from "@tanstack/react-router";
import { StatusCodes } from "http-status-codes";
import { ZodError } from "zod";
import "@tanstack/react-start";
import "@tanstack/react-start/server";
import { bookingAvailabilitySchema } from "#/lib/booking-availability-schema";
import { requireAdmin } from "#/server/admin-request";
import {
	getBookingAvailability,
	updateBookingAvailability,
} from "#/server/booking-availability";
import { failure, jsonBody, success } from "#/server/response";

export const Route = createFileRoute("/api/admin/booking-availability")({
	server: {
		handlers: {
			GET: async ({ request }) => {
				const auth = await requireAdmin(request);
				if (auth.error) return auth.error;
				try {
					return success(
						await getBookingAvailability(),
						"Booking availability loaded.",
					);
				} catch (error) {
					console.error("[admin/booking-availability]", error);
					return failure(
						"Could not load booking availability.",
						StatusCodes.INTERNAL_SERVER_ERROR,
					);
				}
			},
			PUT: async ({ request }) => {
				const auth = await requireAdmin(request);
				if (auth.error) return auth.error;
				const body = await jsonBody<unknown>(request);
				if (body.error) return body.error;
				try {
					const parsed = bookingAvailabilitySchema.parse(body.value);
					return success(
						await updateBookingAvailability(parsed),
						"Booking availability updated.",
					);
				} catch (error) {
					if (error instanceof ZodError) {
						return failure(
							"Please correct the highlighted fields.",
							StatusCodes.UNPROCESSABLE_ENTITY,
							error.issues.map((issue) => issue.message),
						);
					}
					console.error("[admin/booking-availability]", error);
					return failure(
						"Could not update booking availability.",
						StatusCodes.INTERNAL_SERVER_ERROR,
					);
				}
			},
		},
	},
});
