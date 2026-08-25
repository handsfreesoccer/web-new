import { prisma } from "#/db";
import { sendPaymentEmail, sendReminderEmail } from "#/server/email";
import { createAppointmentPaymentLink } from "#/server/stripe";

const day = 24 * 60 * 60 * 1000;

export async function processDueEmails(now = new Date()) {
	const tomorrowStart = new Date(now.getTime() + day);
	tomorrowStart.setUTCHours(0, 0, 0, 0);
	const tomorrowEnd = new Date(tomorrowStart.getTime() + day);
	const yesterdayEnd = new Date(now.getTime() - day);
	const due = await prisma.booking.findMany({
		where: {
			appointmentStartUtc: { gte: tomorrowStart, lt: tomorrowEnd },
			reminderSentAt: null,
		},
	});
	let reminders = 0;
	for (const booking of due) {
		try {
			await sendReminderEmail(booking);
			await prisma.booking.update({
				where: { id: booking.id },
				data: { reminderSentAt: now },
			});
			reminders++;
		} catch (error) {
			await prisma.emailLog.create({
				data: {
					bookingId: booking.id,
					type: "reminder",
					status: "failed",
					error: error instanceof Error ? error.message : String(error),
				},
			});
		}
	}
	const payments = await prisma.booking.findMany({
		where: {
			appointmentStartUtc: { lt: yesterdayEnd },
			paymentSentAt: null,
			paidAt: null,
		},
	});
	let paymentEmails = 0;
	for (const booking of payments) {
		try {
			const url = await createAppointmentPaymentLink(booking);
			if (!url) continue;
			await sendPaymentEmail(booking, url);
			await prisma.booking.update({
				where: { id: booking.id },
				data: { paymentSentAt: now },
			});
			paymentEmails++;
		} catch (error) {
			await prisma.emailLog.create({
				data: {
					bookingId: booking.id,
					type: "payment",
					status: "failed",
					error: error instanceof Error ? error.message : String(error),
				},
			});
		}
	}
	return { reminders, paymentEmails };
}
