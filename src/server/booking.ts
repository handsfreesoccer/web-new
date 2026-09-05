import { getPrisma } from "#/db";
import { isAppointmentWithinAvailability } from "#/lib/booking-availability-schema";
import { bookingSchema } from "#/lib/booking-schema";
import { getBookingAvailability } from "#/server/booking-availability";
import { scheduleBookingCronJobs } from "#/server/cron";
import { sendWelcomeEmail } from "#/server/email";

export async function createBooking(input: unknown) {
	const parsed = bookingSchema.parse(input);
	const availability = await getBookingAvailability();
	const availabilityError = isAppointmentWithinAvailability(
		parsed.appointmentStart,
		parsed.appointmentEnd,
		availability,
	);
	if (availabilityError) {
		throw new Error(availabilityError);
	}
	const prisma = await getPrisma();
	const booking = await prisma.booking.create({
		data: {
			firstName: parsed.firstName,
			lastName: parsed.lastName,
			email: parsed.email,
			phone: parsed.phone,
			classType: parsed.classType,
			appointmentStartUtc: parsed.appointmentStart,
			appointmentEndUtc: parsed.appointmentEnd,
		},
	});

	await scheduleBookingCronJobs(booking);

	try {
		await sendWelcomeEmail(booking);
		const db = await getPrisma();
		await db.booking.update({
			where: { id: booking.id },
			data: { welcomeSentAt: new Date() },
		});
	} catch (error) {
		const db = await getPrisma();
		await db.emailLog.create({
			data: {
				bookingId: booking.id,
				type: "welcome",
				status: "failed",
				error: error instanceof Error ? error.message : String(error),
			},
		});
		console.error(
			"[booking] welcome email failed",
			error instanceof Error ? error.message : error,
		);
	}

	return { id: booking.id };
}
