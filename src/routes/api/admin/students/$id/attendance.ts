import { createFileRoute } from "@tanstack/react-router";
import { StatusCodes } from "http-status-codes";
import "@tanstack/react-start";
import "@tanstack/react-start/server";
import { prisma } from "#/db";
import { requireAdmin } from "#/server/admin-request";
import { failure, jsonBody, success } from "#/server/response";
import { z } from "zod";

export const Route = createFileRoute("/api/admin/students/$id/attendance")({
	server: {
		handlers: {
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
					const attendance = await prisma.attendance.create({
						data: { bookingId, attendedAt: parsed.data },
					});
					return success(attendance, "Attendance marked.", StatusCodes.CREATED);
				} catch {
					return failure("Student was not found.", StatusCodes.NOT_FOUND);
				}
			},
		},
	},
});
