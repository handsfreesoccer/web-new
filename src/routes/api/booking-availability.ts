import { createFileRoute } from "@tanstack/react-router";
import { StatusCodes } from "http-status-codes";
import "@tanstack/react-start";
import "@tanstack/react-start/server";
import { getBookingAvailability } from "#/server/booking-availability";
import { failure, success } from "#/server/response";

export const Route = createFileRoute("/api/booking-availability")({
	server: {
		handlers: {
			GET: async () => {
				try {
					return success(
						await getBookingAvailability(),
						"Booking availability loaded.",
					);
				} catch (error) {
					console.error("[booking-availability]", error);
					return failure(
						"Could not load booking availability.",
						StatusCodes.INTERNAL_SERVER_ERROR,
					);
				}
			},
		},
	},
});
