import { prisma } from "#/db";
import { bookingSchema, type BookingInput } from "#/lib/booking-schema";
import { appendBookingToSpreadsheet } from "#/server/spreadsheet";
import { sendWelcomeEmail } from "#/server/email";

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
	let emailStatus = "sent";
	try {
		await sendWelcomeEmail(booking);
		await prisma.booking.update({
			where: { id: booking.id },
			data: { welcomeSentAt: new Date() },
		});
	} catch (error) {
		emailStatus = "failed";
		await prisma.emailLog.create({
			data: {
				bookingId: booking.id,
				type: "welcome",
				status: "failed",
				error: error instanceof Error ? error.message : String(error),
			},
		});
	}
	return { id: booking.id, emailStatus };
}
