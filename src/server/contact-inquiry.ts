import type { ContactInput } from "#/lib/contact-schema";
import { getPrisma } from "#/db";
import { queueContactConfirmation } from "#/server/email";

export async function createContactInquiry(inquiry: ContactInput) {
	const prisma = await getPrisma();
	await prisma.contactInquiry.create({
		data: {
			fullName: inquiry.fullName,
			email: inquiry.email,
			subject: inquiry.subject,
			message: inquiry.message,
		},
	});
	queueContactConfirmation(inquiry);
	return {};
}
