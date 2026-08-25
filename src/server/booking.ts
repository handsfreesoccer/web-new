import { prisma } from "#/db";
import { bookingSchema, type BookingInput } from "#/lib/booking-schema";
import { sendWelcomeEmail } from "#/server/email";
import { appendBookingToSpreadsheet } from "#/server/spreadsheet";

export async function createBooking(input: unknown) {
	const parsed = bookingSchema.parse(input);
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
			await prisma.booking.update({
				where: { id: booking.id },
				data: { welcomeSentAt: new Date() },
			});
		})
		.catch(async (error) => {
			await prisma.emailLog.create({
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
