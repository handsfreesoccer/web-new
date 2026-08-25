import type { ContactInput } from "#/lib/contact-schema";
import { queueContactConfirmation } from "#/server/email";
import { appendContactInquiryToSpreadsheet } from "#/server/spreadsheet";

export async function createContactInquiry(inquiry: ContactInput) {
	await appendContactInquiryToSpreadsheet(inquiry);
	queueContactConfirmation(inquiry);
	return {};
}
