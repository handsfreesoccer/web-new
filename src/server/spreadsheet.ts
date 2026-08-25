import ExcelJS from "exceljs";
import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import type { BookingInput } from "#/lib/booking-schema";
import type { ContactInput } from "#/lib/contact-schema";

const bookingsWorkbookPath = resolve(process.cwd(), "data/bookings.xlsx");
const inquiriesWorkbookPath = resolve(process.cwd(), "data/contact-inquiries.xlsx");

async function appendRow(
	workbookPath: string,
	sheetName: string,
	columns: ExcelJS.Column[],
	row: Record<string, unknown>,
) {
	await mkdir(dirname(workbookPath), { recursive: true });
	const workbook = new ExcelJS.Workbook();
	try {
		await workbook.xlsx.readFile(workbookPath);
	} catch {
		const sheet = workbook.addWorksheet(sheetName);
		sheet.columns = columns;
	}
	const sheet = workbook.getWorksheet(sheetName) ?? workbook.worksheets[0];
	if (!sheet) throw new Error("Could not create spreadsheet worksheet");
	sheet.addRow(row);
	await workbook.xlsx.writeFile(workbookPath);
}

export async function appendBookingToSpreadsheet(
	booking: BookingInput & { id: number },
) {
	await appendRow(
		bookingsWorkbookPath,
		"Bookings",
		[
			{ header: "ID", key: "id" },
			{ header: "First name", key: "firstName" },
			{ header: "Last name", key: "lastName" },
			{ header: "Email", key: "email" },
			{ header: "Phone", key: "phone" },
			{ header: "Class", key: "classType" },
			{ header: "Appointment start (UTC)", key: "appointmentStart" },
			{ header: "Appointment end (UTC)", key: "appointmentEnd" },
		],
		{
			...booking,
			appointmentStart: booking.appointmentStart.toISOString(),
			appointmentEnd: booking.appointmentEnd?.toISOString() ?? "",
		},
	);
}

export async function appendContactInquiryToSpreadsheet(inquiry: ContactInput) {
	await appendRow(
		inquiriesWorkbookPath,
		"Inquiries",
		[
			{ header: "Received at (UTC)", key: "receivedAt" },
			{ header: "Full name", key: "fullName" },
			{ header: "Email", key: "email" },
			{ header: "Subject", key: "subject" },
			{ header: "Message", key: "message" },
		],
		{
			receivedAt: new Date().toISOString(),
			...inquiry,
		},
	);
}
