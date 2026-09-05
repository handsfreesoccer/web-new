import { getPrisma } from "#/db";
import type { ContactInput } from "#/lib/contact-schema";
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
	try {
		await queueContactConfirmation(inquiry);
	} catch (error) {
		console.error(
			"[contact-inquiry] email failed",
			error instanceof Error ? error.message : error,
		);
	}
	return {};
}
