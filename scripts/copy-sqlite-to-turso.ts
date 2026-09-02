import { join } from "node:path";
import { Database } from "bun:sqlite";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { getTursoAuthToken, getTursoDatabaseUrl } from "../src/database-url.js";

const localPath = join(process.cwd(), "prisma/dev.db");
const local = new Database(localPath, { readonly: true });

const prisma = new PrismaClient({
	adapter: new PrismaLibSql({
		url: getTursoDatabaseUrl(),
		authToken: getTursoAuthToken(),
	}),
});

type BookingRow = {
	id: number;
	firstName: string;
	lastName: string;
	email: string;
	phone: string;
	classType: string;
	appointmentStartUtc: string;
	appointmentEndUtc: string | null;
	welcomeSentAt: string | null;
	reminderSentAt: string | null;
	paymentSentAt: string | null;
	paidAt: string | null;
	createdAt: string;
};

type AttendanceRow = {
	id: number;
	bookingId: number;
	attendedAt: string;
	createdAt: string;
};

type EmailLogRow = {
	id: number;
	bookingId: number | null;
	type: string;
	status: string;
	providerId: string | null;
	scheduledFor: string | null;
	sentAt: string | null;
	error: string | null;
	createdAt: string;
};

type AvailabilityRow = {
	id: number;
	availableDays: string;
	startTime: string;
	endTime: string;
	minuteStep: number;
	minNoticeHours: number;
	maxAdvanceDays: number;
	updatedAt: string;
};

const toDate = (value: string | null) => (value ? new Date(value) : null);

async function main() {
	const bookings = local.query("SELECT * FROM Booking").all() as BookingRow[];
	const attendances = local
		.query("SELECT * FROM Attendance")
		.all() as AttendanceRow[];
	const emailLogs = local.query("SELECT * FROM EmailLog").all() as EmailLogRow[];
	const availability = local
		.query("SELECT * FROM BookingAvailability")
		.all() as AvailabilityRow[];

	console.log(
		`Copying ${bookings.length} bookings, ${attendances.length} attendances, ${emailLogs.length} email logs, ${availability.length} availability rows`,
	);

	await prisma.attendance.deleteMany();
	await prisma.emailLog.deleteMany();
	await prisma.booking.deleteMany();
	await prisma.bookingAvailability.deleteMany();

	for (const booking of bookings) {
		await prisma.booking.create({
			data: {
				id: booking.id,
				firstName: booking.firstName,
				lastName: booking.lastName,
				email: booking.email,
				phone: booking.phone,
				classType: booking.classType,
				appointmentStartUtc: new Date(booking.appointmentStartUtc),
				appointmentEndUtc: toDate(booking.appointmentEndUtc),
				welcomeSentAt: toDate(booking.welcomeSentAt),
				reminderSentAt: toDate(booking.reminderSentAt),
				paymentSentAt: toDate(booking.paymentSentAt),
				paidAt: toDate(booking.paidAt),
				createdAt: new Date(booking.createdAt),
			},
		});
	}

	for (const attendance of attendances) {
		await prisma.attendance.create({
			data: {
				id: attendance.id,
				bookingId: attendance.bookingId,
				attendedAt: new Date(attendance.attendedAt),
				createdAt: new Date(attendance.createdAt),
			},
		});
	}

	for (const log of emailLogs) {
		await prisma.emailLog.create({
			data: {
				id: log.id,
				bookingId: log.bookingId,
				type: log.type,
				status: log.status,
				providerId: log.providerId,
				scheduledFor: toDate(log.scheduledFor),
				sentAt: toDate(log.sentAt),
				error: log.error,
				createdAt: new Date(log.createdAt),
			},
		});
	}

	for (const row of availability) {
		await prisma.bookingAvailability.create({
			data: {
				id: row.id,
				availableDays: row.availableDays,
				startTime: row.startTime,
				endTime: row.endTime,
				minuteStep: row.minuteStep,
				minNoticeHours: row.minNoticeHours,
				maxAdvanceDays: row.maxAdvanceDays,
				updatedAt: new Date(row.updatedAt),
			},
		});
	}

	console.log("Copied local SQLite data to Turso.");
}

main()
	.catch((error) => {
		console.error(error);
		process.exit(1);
	})
	.finally(async () => {
		local.close();
		await prisma.$disconnect();
	});
