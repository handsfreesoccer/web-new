import { sendContactConfirmation } from "#/server/email";
import { appendContactInquiryToSpreadsheet } from "#/server/spreadsheet";
import type { ContactInput } from "#/lib/contact-schema";

export async function createContactInquiry(inquiry: ContactInput) {
	await appendContactInquiryToSpreadsheet(inquiry);

	let emailStatus: "sent" | "failed" = "sent";
	try {
		await sendContactConfirmation(inquiry);
	} catch (error) {
		emailStatus = "failed";
		console.error("[contact-inquiries]", error);
	}

	return { emailStatus };
}
