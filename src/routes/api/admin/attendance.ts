import { createFileRoute } from "@tanstack/react-router";
import { StatusCodes } from "http-status-codes";
import "@tanstack/react-start";
import "@tanstack/react-start/server";
import { parseISO } from "date-fns";
import { requireAdmin } from "#/server/admin-request";
import {
	listAttendanceDatesByMonth,
	listAttendancesByDate,
} from "#/server/attendance";
import { failure, success } from "#/server/response";

const monthPattern = /^(\d{4})-(0[1-9]|1[0-2])$/;

export const Route = createFileRoute("/api/admin/attendance")({
	server: {
		handlers: {
			GET: async ({ request }) => {
				const auth = await requireAdmin(request);
				if (auth.error) return auth.error;

				const url = new URL(request.url);
				const monthParam = url.searchParams.get("month");
				const dateParam = url.searchParams.get("date");

				if (monthParam) {
					const match = monthPattern.exec(monthParam);
					if (!match) {
						return failure(
							"Use a valid month (YYYY-MM).",
							StatusCodes.UNPROCESSABLE_ENTITY,
						);
					}

					const year = Number(match[1]);
					const month = Number(match[2]);
					const dates = await listAttendanceDatesByMonth(year, month);
					return success({ dates }, "Attendance dates loaded.");
				}

				if (dateParam) {
					const parsed = parseISO(dateParam);
					if (Number.isNaN(parsed.getTime())) {
						return failure(
							"Use a valid date (YYYY-MM-DD).",
							StatusCodes.UNPROCESSABLE_ENTITY,
						);
					}

					const attendances = await listAttendancesByDate(parsed);
					return success(attendances, "Attendance loaded.");
				}

				return failure(
					"Provide a date (YYYY-MM-DD) or month (YYYY-MM).",
					StatusCodes.BAD_REQUEST,
				);
			},
		},
	},
});
