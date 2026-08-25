import type { ContactInput } from "#/lib/contact-schema";
import { sendContactConfirmation } from "#/server/email";
import { runInBackground } from "#/server/run-in-background";
import { appendContactInquiryToSpreadsheet } from "#/server/spreadsheet";

export async function createContactInquiry(inquiry: ContactInput) {
	await appendContactInquiryToSpreadsheet(inquiry);

	runInBackground("contact:confirmation", async () => {
		await sendContactConfirmation(inquiry);
	});

	return {};
}
