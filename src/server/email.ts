import { Resend } from "resend";
import type { ContactInput } from "#/lib/contact-schema";
import { ADMIN_EMAIL } from "#/server/auth";
import { createCalendarInvite } from "#/server/calendar";
import {
	currentYear,
	getResendTemplateId,
	getResendTemplateVariables,
	type ResendTemplateName,
} from "#/server/resend-templates";

const getResend = () => {
	const apiKey = process.env.RESEND_API_KEY?.trim();
	return apiKey ? new Resend(apiKey) : null;
};

const resolveEmailFrom = () =>
	process.env.RESEND_FROM?.trim() ||
	process.env.EMAIL_FROM?.trim() ||
	"Hands Free Soccer <onboarding@resend.dev>";

const isSandboxMode = (from: string) => from.includes("@resend.dev");

const sandboxRecipient = () =>
	process.env.RESEND_SANDBOX_TO?.trim() || ADMIN_EMAIL;

const resolveRecipients = (from: string, to: string | string[]) => {
	if (!isSandboxMode(from)) return to;

	const intended = Array.isArray(to) ? to.join(", ") : to;
	const redirected = sandboxRecipient();

	if (intended.toLowerCase() !== redirected.toLowerCase()) {
		console.info(
			`[email] Resend sandbox redirect: ${intended} → ${redirected}`,
		);
	}

	return redirected;
};

const sandboxSubject = (
	from: string,
	to: string | string[],
	subject?: string,
) => {
	if (!isSandboxMode(from) || !subject) return subject;
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

type BookingReminderEmail = BookingEmail & {
	classType: string;
	appointmentEndUtc: Date | null;
};

const APPOINTMENT_TIMEZONE =
	process.env.APPOINTMENT_TIMEZONE ?? "America/Chicago";

const formatClassType = (classType: string) =>
	classType.replaceAll("-", " ").replace(/\b\w/g, (char) => char.toUpperCase());

const getAppointmentEnd = (booking: {
	appointmentStartUtc: Date;
	appointmentEndUtc: Date | null;
}) =>
	booking.appointmentEndUtc ??
	new Date(booking.appointmentStartUtc.getTime() + 60 * 60 * 1000);

const formatAppointmentVariables = (booking: {
	appointmentStartUtc: Date;
	appointmentEndUtc: Date | null;
	classType: string;
}) => {
	const end = getAppointmentEnd(booking);
	const timeFormat: Intl.DateTimeFormatOptions = {
		timeZone: APPOINTMENT_TIMEZONE,
		hour: "numeric",
		minute: "2-digit",
	};
	const dateFormat: Intl.DateTimeFormatOptions = {
		timeZone: APPOINTMENT_TIMEZONE,
		weekday: "long",
		month: "long",
		day: "numeric",
		year: "numeric",
	};
	const timezoneLabel =
		new Intl.DateTimeFormat("en-US", {
			timeZone: APPOINTMENT_TIMEZONE,
			timeZoneName: "short",
		})
			.formatToParts(booking.appointmentStartUtc)
			.find((part) => part.type === "timeZoneName")?.value ?? "Central";

	const appointmentStartTime = new Intl.DateTimeFormat(
		"en-US",
		timeFormat,
	).format(booking.appointmentStartUtc);
	const appointmentEndTime = new Intl.DateTimeFormat(
		"en-US",
		timeFormat,
	).format(end);

	return {
		appointment_date: new Intl.DateTimeFormat("en-US", dateFormat).format(
			booking.appointmentStartUtc,
		),
		appointment_start_time: appointmentStartTime,
		appointment_end_time: appointmentEndTime,
		appointment_time_range: `${appointmentStartTime} – ${appointmentEndTime} ${timezoneLabel}`,
		timezone_label: timezoneLabel,
		class_type: formatClassType(booking.classType),
	};
};

const zonedYmd = (date: Date) => {
	const parts = new Intl.DateTimeFormat("en-US", {
		timeZone: APPOINTMENT_TIMEZONE,
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).formatToParts(date);
	const value = (type: Intl.DateTimeFormatPartTypes) =>
		Number(parts.find((part) => part.type === type)?.value);
	return Date.UTC(value("year"), value("month") - 1, value("day"));
};

export function appointmentWhenPhrase(
	appointmentStartUtc: Date,
	now = new Date(),
) {
	const days = Math.round(
		(zonedYmd(appointmentStartUtc) - zonedYmd(now)) / 86_400_000,
	);
	if (days <= 0) return "today";
	if (days === 1) return "tomorrow";
	return `in ${days} days`;
}

type TemplateVariables = Record<string, string | number>;

const logEmailFailure = (label: string) => (error: unknown) => {
	console.error(
		`[email:${label}]`,
		error instanceof Error ? error.message : error,
	);
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const isRetryableEmailError = (error: unknown) => {
	const message = error instanceof Error ? error.message : String(error);
	return /timeout|timed out|network|econnreset|enotfound|429|500|502|503|504|rate limit|unable to process/i.test(
		message,
	);
};

const allowedTemplateVariables = (
	template: ResendTemplateName,
	variables: TemplateVariables,
) => {
	const allowed = new Set(getResendTemplateVariables(template));
	return Object.fromEntries(
		Object.entries({ year: currentYear(), ...variables }).filter(([key]) =>
			allowed.has(key),
		),
	);
};

async function sendTemplate(
	template: ResendTemplateName,
	to: string | string[],
	variables: TemplateVariables,
	options?: {
		subject?: string;
		replyTo?: string;
		attachments?: NonNullable<
			Parameters<Resend["emails"]["send"]>[0]["attachments"]
		>;
	},
) {
	const resend = getResend();
	if (!resend) {
		console.info(`[email] Skipped (${template}) — RESEND_API_KEY is not set`);
		return { id: "local-preview" };
	}

	const from = resolveEmailFrom();
	const payload = {
		from,
		to: resolveRecipients(from, to),
		subject: sandboxSubject(from, to, options?.subject),
		...(options?.replyTo ? { replyTo: options.replyTo } : {}),
		template: {
			id: getResendTemplateId(template),
			variables: allowedTemplateVariables(template, variables),
		},
		attachments: options?.attachments,
	} satisfies Parameters<Resend["emails"]["send"]>[0];

	let lastError: unknown;
	for (let attempt = 1; attempt <= 3; attempt++) {
		try {
			const result = await resend.emails.send(payload);
			if (result.error) throw new Error(result.error.message);
			console.info(`[email] Sent ${template} → ${payload.to}`);
			return result.data;
		} catch (error) {
			lastError = error;
			if (attempt === 3 || !isRetryableEmailError(error)) break;
			await sleep(400 * 2 ** (attempt - 1));
		}
	}

	throw lastError instanceof Error
		? lastError
		: new Error(String(lastError ?? `Failed to send ${template}`));
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

export async function sendPaymentEmail(booking: BookingEmail) {
	const coachPhone = process.env.HEAD_COACH_PHONE?.trim() || "(469) 288-2265";
	const coachEmail = process.env.HEAD_COACH_EMAIL?.trim() || ADMIN_EMAIL;
	return sendTemplate(
		"payment-link",
		booking.email,
		{
			first_name: booking.firstName,
			coach_name: process.env.HEAD_COACH_NAME?.trim() || "the head coach",
			coach_email: coachEmail,
			coach_phone: coachPhone,
			coach_phone_href: `tel:${coachPhone.replaceAll(/[^\d+]/g, "")}`,
		},
		{
			subject: "Hands Free Soccer — payment for your session",
		},
	);
}

export async function sendReminderEmail(booking: BookingReminderEmail) {
	const maps =
		process.env.GOOGLE_MAPS_URL ?? "https://maps.google.com/?q=Allen,Texas";
	const end = getAppointmentEnd(booking);
	const when = appointmentWhenPhrase(booking.appointmentStartUtc);
	return sendTemplate(
		"appointment-reminder",
		booking.email,
		{
			first_name: booking.firstName,
			maps_url: maps,
			when,
			...formatAppointmentVariables(booking),
		},
		{
			subject: `Your Hands Free Soccer appointment is ${when}`,
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

const INQUIRY_SUBJECT_LABELS: Record<ContactInput["subject"], string> = {
	classes: "Classes",
	schedules: "Schedules",
	enrollment: "Enrollment",
	private: "Private Coaching",
	other: "Other",
};

const contactInquiryVariables = (inquiry: ContactInput) => ({
	full_name: inquiry.fullName,
	subject: INQUIRY_SUBJECT_LABELS[inquiry.subject] ?? inquiry.subject,
	message: inquiry.message,
});

export async function sendContactConfirmation(inquiry: ContactInput) {
	return sendTemplate(
		"contact-inquiry-received",
		inquiry.email,
		contactInquiryVariables(inquiry),
		{
			subject: "We received your Hands Free Soccer inquiry",
		},
	);
}

export async function sendContactInquiryNotification(inquiry: ContactInput) {
	return sendTemplate(
		"contact-inquiry-notification",
		ADMIN_EMAIL,
		{
			...contactInquiryVariables(inquiry),
			email: inquiry.email,
		},
		{
			subject: `New Hands Free Soccer inquiry from ${inquiry.fullName}`,
			replyTo: inquiry.email,
		},
	);
}

export async function queueWelcomeEmail(booking: BookingEmail) {
	try {
		await sendWelcomeEmail(booking);
	} catch (error) {
		logEmailFailure("booking-welcome")(error);
		throw error;
	}
}

export async function queueContactConfirmation(inquiry: ContactInput) {
	const results = await Promise.allSettled([
		sendContactConfirmation(inquiry),
		sendContactInquiryNotification(inquiry),
	]);
	const failures = results.filter((result) => result.status === "rejected");
	if (results[0]?.status === "rejected") {
		logEmailFailure("contact-inquiry-received")(results[0].reason);
	}
	if (results[1]?.status === "rejected") {
		logEmailFailure("contact-inquiry-notification")(results[1].reason);
	}
	if (failures.length === results.length) {
		throw failures[0]?.status === "rejected"
			? failures[0].reason
			: new Error("Contact inquiry emails failed");
	}
}

export async function queueAdminMagicLink(email: string, link: string) {
	try {
		await sendAdminMagicLink(email, link);
	} catch (error) {
		logEmailFailure("admin-sign-in")(error);
		throw error;
	}
}

export async function queuePaymentEmail(booking: BookingEmail) {
	try {
		await sendPaymentEmail(booking);
	} catch (error) {
		logEmailFailure("payment-link")(error);
		throw error;
	}
}

export async function queueReminderEmail(booking: BookingReminderEmail) {
	try {
		await sendReminderEmail(booking);
	} catch (error) {
		logEmailFailure("appointment-reminder")(error);
		throw error;
	}
}
