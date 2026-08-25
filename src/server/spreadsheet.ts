import ExcelJS from "exceljs";
import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import type { BookingInput } from "#/lib/booking-schema";

const workbookPath = resolve(process.cwd(), "data/bookings.xlsx");

export async function appendBookingToSpreadsheet(
	booking: BookingInput & { id: number },
) {
	await mkdir(dirname(workbookPath), { recursive: true });
	const workbook = new ExcelJS.Workbook();
	try {
		await workbook.xlsx.readFile(workbookPath);
	} catch {
		const sheet = workbook.addWorksheet("Bookings");
		sheet.columns = [
			{ header: "ID", key: "id" },
			{ header: "First name", key: "firstName" },
			{ header: "Last name", key: "lastName" },
			{ header: "Email", key: "email" },
			{ header: "Phone", key: "phone" },
			{ header: "Class", key: "classType" },
			{ header: "Appointment start (UTC)", key: "appointmentStart" },
			{ header: "Appointment end (UTC)", key: "appointmentEnd" },
		];
	}
	const sheet = workbook.getWorksheet("Bookings") ?? workbook.worksheets[0];
	if (!sheet) throw new Error("Could not create spreadsheet worksheet");
	sheet.addRow({
		...booking,
		appointmentStart: booking.appointmentStart.toISOString(),
		appointmentEnd: booking.appointmentEnd?.toISOString() ?? "",
	});
	await workbook.xlsx.writeFile(workbookPath);
}
