import { endOfDay, endOfMonth, startOfDay, startOfMonth } from "date-fns";
import { getPrisma } from "#/db";
import { toDateKey } from "#/lib/admin-attendance";

export async function listAttendancesByBookingId(bookingId: number) {
	const prisma = await getPrisma();
	return prisma.attendance.findMany({
		where: { bookingId },
		orderBy: { attendedAt: "desc" },
	});
}

export async function listAttendancesByDate(date: Date) {
	const prisma = await getPrisma();
	const start = startOfDay(date);
	const end = endOfDay(date);

	return prisma.attendance.findMany({
		where: {
			attendedAt: { gte: start, lte: end },
		},
		include: {
			booking: {
				select: {
					id: true,
					firstName: true,
					lastName: true,
					email: true,
					phone: true,
					classType: true,
				},
			},
		},
		orderBy: { attendedAt: "asc" },
	});
}

export async function listAttendanceDatesByMonth(year: number, month: number) {
	const prisma = await getPrisma();
	const start = startOfMonth(new Date(year, month - 1, 1));
	const end = endOfMonth(start);

	const attendances = await prisma.attendance.findMany({
		where: {
			attendedAt: { gte: start, lte: end },
		},
		select: { attendedAt: true },
		orderBy: { attendedAt: "asc" },
	});

	const dates = new Set<string>();
	for (const record of attendances) {
		dates.add(toDateKey(record.attendedAt));
	}

	return [...dates].sort();
}

export async function createAttendance(bookingId: number, attendedAt: Date) {
	const prisma = await getPrisma();
	return prisma.attendance.create({
		data: { bookingId, attendedAt },
	});
}
