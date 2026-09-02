import { getPrisma } from "#/db";
import { sendPaymentEmail, sendReminderEmail } from "#/server/email";

export const CRON_JOB_TYPES = ["reminder", "payment"] as const;
export type CronJobType = (typeof CRON_JOB_TYPES)[number];

export const CRON_MAX_ATTEMPTS = 3;

function startOfUtcDay(date: Date) {
	return new Date(
		Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
	);
}

export function reminderScheduledFor(appointmentStartUtc: Date) {
	const dayBefore = new Date(appointmentStartUtc);
	dayBefore.setUTCDate(dayBefore.getUTCDate() - 1);
	return startOfUtcDay(dayBefore);
}

export function paymentScheduledFor(appointmentStartUtc: Date) {
	return new Date(appointmentStartUtc.getTime() + 24 * 60 * 60 * 1000);
}

export async function scheduleBookingCronJobs(booking: {
	id: number;
	appointmentStartUtc: Date;
	reminderSentAt?: Date | null;
	paymentSentAt?: Date | null;
}) {
	const prisma = await getPrisma();
	const jobs = [
		{
			type: "reminder" as const,
			scheduledFor: reminderScheduledFor(booking.appointmentStartUtc),
			alreadySent: booking.reminderSentAt ?? null,
		},
		{
			type: "payment" as const,
			scheduledFor: paymentScheduledFor(booking.appointmentStartUtc),
			alreadySent: booking.paymentSentAt ?? null,
		},
	];

	for (const job of jobs) {
		await prisma.cronJob.upsert({
			where: {
				bookingId_type: { bookingId: booking.id, type: job.type },
			},
			create: {
				bookingId: booking.id,
				type: job.type,
				scheduledFor: job.scheduledFor,
				status: job.alreadySent ? "sent" : "pending",
				sentAt: job.alreadySent,
			},
			update: {},
		});
	}
}

export async function enqueueMissingCronJobs() {
	const prisma = await getPrisma();
	const bookings = await prisma.booking.findMany({
		select: {
			id: true,
			appointmentStartUtc: true,
			reminderSentAt: true,
			paymentSentAt: true,
			cronJobs: { select: { type: true } },
		},
	});

	let created = 0;
	for (const booking of bookings) {
		const existing = new Set(booking.cronJobs.map((job) => job.type));
		if (existing.has("reminder") && existing.has("payment")) continue;
		await scheduleBookingCronJobs(booking);
		created++;
	}
	return created;
}

async function dispatchCronJob(
	type: CronJobType,
	booking: Parameters<typeof sendReminderEmail>[0],
) {
	if (type === "reminder") {
		await sendReminderEmail(booking);
		return;
	}
	await sendPaymentEmail(booking);
}

export async function processDueCronJobs(now = new Date()) {
	const prisma = await getPrisma();
	const due = await prisma.cronJob.findMany({
		where: {
			status: "pending",
			scheduledFor: { lte: now },
			attempts: { lt: CRON_MAX_ATTEMPTS },
		},
		include: { booking: true },
		orderBy: { scheduledFor: "asc" },
	});

	let sent = 0;
	let failed = 0;
	let retried = 0;

	for (const job of due) {
		const attempts = job.attempts + 1;
		try {
			await dispatchCronJob(job.type as CronJobType, job.booking);
			await prisma.cronJob.update({
				where: { id: job.id },
				data: {
					status: "sent",
					attempts,
					sentAt: now,
					lastError: null,
				},
			});
			if (job.type === "reminder") {
				await prisma.booking.update({
					where: { id: job.bookingId },
					data: { reminderSentAt: now },
				});
			}
			if (job.type === "payment") {
				await prisma.booking.update({
					where: { id: job.bookingId },
					data: { paymentSentAt: now },
				});
			}
			sent++;
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			const exhausted = attempts >= CRON_MAX_ATTEMPTS;
			await prisma.cronJob.update({
				where: { id: job.id },
				data: {
					attempts,
					lastError: message,
					status: exhausted ? "failed" : "pending",
				},
			});
			await prisma.emailLog.create({
				data: {
					bookingId: job.bookingId,
					type: job.type,
					status: "failed",
					error: message,
				},
			});
			if (exhausted) failed++;
			else retried++;
		}
	}

	return { processed: due.length, sent, retried, failed };
}

export async function processDueEmails(now = new Date()) {
	const enqueued = await enqueueMissingCronJobs();
	const result = await processDueCronJobs(now);
	return { enqueued, ...result };
}

export async function markCronJobSent(
	bookingId: number,
	type: CronJobType,
	now = new Date(),
) {
	const prisma = await getPrisma();
	await prisma.cronJob.updateMany({
		where: { bookingId, type, status: "pending" },
		data: {
			status: "sent",
			sentAt: now,
			lastError: null,
		},
	});
	if (type === "reminder") {
		await prisma.booking.update({
			where: { id: bookingId },
			data: { reminderSentAt: now },
		});
	}
	if (type === "payment") {
		await prisma.booking.update({
			where: { id: bookingId },
			data: { paymentSentAt: now },
		});
	}
}
