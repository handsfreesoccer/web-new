import { createFileRoute } from "@tanstack/react-router";
import { StatusCodes } from "http-status-codes";
import "@tanstack/react-start";
import "@tanstack/react-start/server";
import { requireAdmin } from "#/server/admin-request";
import {
	createAttendance,
	listAttendancesByBookingId,
} from "#/server/attendance";
import { failure, jsonBody, success } from "#/server/response";
import { z } from "zod";

export const Route = createFileRoute("/api/admin/students/$id/attendance")({
	server: {
		handlers: {
			GET: async ({ request, params }) => {
				const auth = await requireAdmin(request);
				if (auth.error) return auth.error;

				const bookingId = Number(params.id);
				if (!Number.isInteger(bookingId)) {
					return failure("Invalid student.", StatusCodes.BAD_REQUEST);
				}

				const attendances = await listAttendancesByBookingId(bookingId);
				return success(attendances, "Visit history loaded.");
			},
			POST: async ({ request, params }) => {
				const auth = await requireAdmin(request);
				if (auth.error) return auth.error;
				const body = await jsonBody<{ attendedAt?: string }>(request);
				if (body.error) return body.error;
				const parsed = z.coerce
					.date()
					.safeParse(body.value.attendedAt ?? new Date());
				if (!parsed.success)
					return failure(
						"Choose a valid attendance date.",
						StatusCodes.UNPROCESSABLE_ENTITY,
					);
				const bookingId = Number(params.id);
				if (!Number.isInteger(bookingId))
					return failure("Invalid student.", StatusCodes.BAD_REQUEST);
				try {
					const attendance = await createAttendance(bookingId, parsed.data);
					return success(attendance, "Attendance marked.", StatusCodes.CREATED);
				} catch {
					return failure("Student was not found.", StatusCodes.NOT_FOUND);
				}
			},
		},
	},
});
