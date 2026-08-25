import { Resend } from "resend";
import type { ContactInput } from "#/lib/contact-schema";
import { createCalendarInvite } from "#/server/calendar";
import {
	currentYear,
	getResendTemplateId,
	type ResendTemplateName,
} from "#/server/resend-templates";

const resend = process.env.RESEND_API_KEY
	? new Resend(process.env.RESEND_API_KEY)
	: null;

const resolveEmailFrom = () =>
	process.env.RESEND_FROM?.trim() ||
	process.env.EMAIL_FROM?.trim() ||
	"Hands Free Soccer <onboarding@resend.dev>";

const from = resolveEmailFrom();
const appUrl = (process.env.APP_URL ?? "http://localhost:5173").replace(
	/\/$/,
	"",
);

type BookingEmail = {
	id: number;
	firstName: string;
	lastName: string;
	email: string;
	appointmentStartUtc: Date;
};

type TemplateVariables = Record<string, string | number>;

async function sendTemplate(
	template: ResendTemplateName,
	to: string | string[],
	variables: TemplateVariables,
	options?: {
		subject?: string;
		attachments?: NonNullable<
			Parameters<Resend["emails"]["send"]>[0]["attachments"]
		>;
	},
) {
	if (!resend) return { id: "local-preview" };

	const payload = {
		from,
		to,
		subject: options?.subject,
		template: {
			id: getResendTemplateId(template),
			variables: {
				app_url: appUrl,
				year: currentYear(),
				...variables,
			},
		},
		attachments: options?.attachments,
	} satisfies Parameters<Resend["emails"]["send"]>[0];

	const result = await resend.emails.send(payload);
	if (result.error) throw new Error(result.error.message);
	return result.data;
}

export async function sendWelcomeEmail(booking: BookingEmail) {
	const end = new Date(booking.appointmentStartUtc.getTime() + 60 * 60 * 1000);
	return sendTemplate(
		"booking-welcome",
		booking.email,
		{
			first_name: booking.firstName,
			last_name: booking.lastName,
		},
		{
			subject: "We received your Hands Free Soccer booking",
			attachments: [
				{
					filename: "hands-free-soccer-appointment.ics",
					content: Buffer.from(
						createCalendarInvite({
							uid: String(booking.id),
							firstName: booking.firstName,
							start: booking.appointmentStartUtc,
							end,
						}),
					).toString("base64"),
				},
			],
		},
	);
}

export async function sendPaymentEmail(
	booking: BookingEmail,
	paymentUrl: string,
) {
	return sendTemplate(
		"payment-link",
		booking.email,
		{
			first_name: booking.firstName,
			payment_url: paymentUrl,
		},
		{
			subject: "Your Hands Free Soccer appointment payment link",
		},
	);
}

export async function sendReminderEmail(booking: BookingEmail) {
	const maps =
		process.env.GOOGLE_MAPS_URL ?? "https://maps.google.com/?q=Allen,Texas";
	return sendTemplate(
		"appointment-reminder",
		booking.email,
		{
			first_name: booking.firstName,
			maps_url: maps,
		},
		{
			subject: "Your Hands Free Soccer appointment is tomorrow",
		},
	);
}

export async function sendAdminMagicLink(email: string, link: string) {
	return sendTemplate(
		"admin-sign-in",
		email,
		{
			sign_in_url: link,
		},
		{
			subject: "Your Hands Free Soccer admin sign-in link",
		},
	);
}

export async function sendContactConfirmation(inquiry: ContactInput) {
	return sendTemplate(
		"contact-inquiry-received",
		inquiry.email,
		{
			full_name: inquiry.fullName,
			subject: inquiry.subject,
			message: inquiry.message,
		},
		{
			subject: "We received your Hands Free Soccer inquiry",
		},
	);
}
