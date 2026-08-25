import { getPrisma } from "#/db";
import { bookingSchema, type BookingInput } from "#/lib/booking-schema";
import { isAppointmentWithinAvailability } from "#/lib/booking-availability-schema";
import { getBookingAvailability } from "#/server/booking-availability";
import { sendWelcomeEmail } from "#/server/email";
import { appendBookingToSpreadsheet } from "#/server/spreadsheet";

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
	const spreadsheetInput: BookingInput & { id: number } = {
		...parsed,
		id: booking.id,
	};
	await appendBookingToSpreadsheet(spreadsheetInput);

	void sendWelcomeEmail(booking)
		.then(async () => {
			const db = await getPrisma();
			await db.booking.update({
				where: { id: booking.id },
				data: { welcomeSentAt: new Date() },
			});
		})
		.catch(async (error) => {
			const db = await getPrisma();
			await db.emailLog.create({
				data: {
					bookingId: booking.id,
					type: "welcome",
					status: "failed",
					error: error instanceof Error ? error.message : String(error),
				},
			});
		});

	return { id: booking.id };
}
