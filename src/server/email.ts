import { Resend } from "resend";
import type { ContactInput } from "#/lib/contact-schema";
import { ADMIN_EMAIL } from "#/server/auth";
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

const isSandboxMode = () => from.includes("@resend.dev");

const sandboxRecipient = () =>
	process.env.RESEND_SANDBOX_TO?.trim() || ADMIN_EMAIL;

const resolveRecipients = (to: string | string[]) => {
	if (!isSandboxMode()) return to;

	const intended = Array.isArray(to) ? to.join(", ") : to;
	const redirected = sandboxRecipient();

	if (intended.toLowerCase() !== redirected.toLowerCase()) {
		console.info(`[email] Resend sandbox redirect: ${intended} → ${redirected}`);
	}

	return redirected;
};

const sandboxSubject = (to: string | string[], subject?: string) => {
	if (!isSandboxMode() || !subject) return subject;
	const intended = Array.isArray(to) ? to.join(", ") : to;
	return `[Sandbox · intended: ${intended}] ${subject}`;
};

type BookingEmail = {
	id: number;
	firstName: string;
	lastName: string;
	email: string;
	appointmentStartUtc: Date;
};

type TemplateVariables = Record<string, string | number>;

const logEmailFailure = (label: string) => (error: unknown) => {
	console.error(
		`[email:${label}]`,
		error instanceof Error ? error.message : error,
	);
};

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
	if (!resend) {
		console.info(`[email] Skipped (${template}) — RESEND_API_KEY is not set`);
		return { id: "local-preview" };
	}

	const payload = {
		from,
		to: resolveRecipients(to),
		subject: sandboxSubject(to, options?.subject),
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
	console.info(`[email] Sent ${template} → ${payload.to}`);
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

/** Fire-and-forget — does not block the caller. */
export function queueWelcomeEmail(booking: BookingEmail) {
	void sendWelcomeEmail(booking).catch(logEmailFailure("booking-welcome"));
}

/** Fire-and-forget — does not block the caller. */
export function queueContactConfirmation(inquiry: ContactInput) {
	void sendContactConfirmation(inquiry).catch(
		logEmailFailure("contact-inquiry-received"),
	);
}

/** Fire-and-forget — does not block the caller. */
export function queueAdminMagicLink(email: string, link: string) {
	void sendAdminMagicLink(email, link).catch(logEmailFailure("admin-sign-in"));
}

/** Fire-and-forget — does not block the caller. */
export function queuePaymentEmail(booking: BookingEmail, paymentUrl: string) {
	void sendPaymentEmail(booking, paymentUrl).catch(logEmailFailure("payment-link"));
}

/** Fire-and-forget — does not block the caller. */
export function queueReminderEmail(booking: BookingEmail) {
	void sendReminderEmail(booking).catch(logEmailFailure("appointment-reminder"));
}
