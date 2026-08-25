import { Resend } from "resend";
import type { ContactInput } from "#/lib/contact-schema";
import { createCalendarInvite } from "#/server/calendar";

const resend = process.env.RESEND_API_KEY
	? new Resend(process.env.RESEND_API_KEY)
	: null;
const from =
	process.env.EMAIL_FROM ?? "Hands Free Soccer <handsfreesoccer@gmail.com>";

const escapeHtml = (value: string) =>
	value
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&#039;");

type BookingEmail = {
	id: number;
	firstName: string;
	lastName: string;
	email: string;
	appointmentStartUtc: Date;
};

const layout = (title: string, body: string) =>
	`<!doctype html><html><body style="margin:0;background:#fff;font-family:Arial,Helvetica,sans-serif;color:#001219"><main style="max-width:600px;margin:32px auto;background:#fff;border:1px solid #001219;padding:44px 42px"><div style="width:140px;height:48px;border:1px dashed #a81414;border-radius:4px;line-height:48px;text-align:center;color:#a81414;font-size:11px;font-weight:bold;letter-spacing:1px">LOGO</div><div style="height:42px"></div><h1 style="border-bottom:1px solid #001219;padding-bottom:18px;color:#001219;font-size:24px">${title}</h1><div style="height:18px"></div>${body}<div style="height:40px"></div><div style="border-top:1px solid #001219;padding-top:24px;color:#001219;font-size:14px;line-height:20px"><strong>Hands Free Soccer</strong><br>Serving Allen, McKinney, Melissa &amp; Princeton, TX</div></main></body></html>`;

async function send(params: Parameters<Resend["emails"]["send"]>[0]) {
	if (!resend) return { id: "local-preview" };
	const result = await resend.emails.send(params);
	if (result.error) throw new Error(result.error.message);
	return result.data;
}

export async function sendWelcomeEmail(booking: BookingEmail) {
	const end = new Date(booking.appointmentStartUtc.getTime() + 60 * 60 * 1000);
	return send({
		from,
		to: booking.email,
		subject: "We received your Hands Free Soccer booking",
		html: layout(
			"Thanks for registering",
			`<p>Hi ${booking.firstName},</p><p>We have received your booking information and look forward to seeing you.</p>`,
		),
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
	});
}

export async function sendPaymentEmail(
	booking: BookingEmail,
	paymentUrl: string,
) {
	return send({
		from,
		to: booking.email,
		subject: "Your Hands Free Soccer appointment payment link",
		html: layout(
			"We were glad to have you",
			`<p>Hi ${booking.firstName},</p><p>Thank you for training with us. Use the link below to pay for your appointment.</p><p><a href="${paymentUrl}" style="display:inline-block;background:#a81414;color:#fff;padding:14px 22px;border-radius:4px">Pay for appointment</a></p>`,
		),
	});
}

export async function sendReminderEmail(booking: BookingEmail) {
	const maps =
		process.env.GOOGLE_MAPS_URL ?? "https://maps.google.com/?q=Allen,Texas";
	return send({
		from,
		to: booking.email,
		subject: "Your Hands Free Soccer appointment is tomorrow",
		html: layout(
			"See you tomorrow",
			`<p>Hi ${booking.firstName},</p><p>Your appointment is tomorrow. We cannot wait to have you with us.</p><p><strong>Location:</strong> <a href="${maps}">Hands Free Soccer courts</a><br><strong>Phone:</strong> <a href="tel:+14692882265">(469) 288-2265</a></p>`,
		),
	});
}

export async function sendAdminMagicLink(email: string, link: string) {
	return send({
		from,
		to: email,
		subject: "Your Hands Free Soccer admin sign-in link",
		html: layout(
			"Sign in to the dashboard",
			`<p>This link expires in 15 minutes.</p><p><a href="${link}" style="display:inline-block;background:#a81414;color:#fff;padding:14px 22px;border-radius:4px">Open dashboard</a></p>`,
		),
	});
}

export async function sendContactConfirmation(inquiry: ContactInput) {
	const fullName = escapeHtml(inquiry.fullName);
	const subject = escapeHtml(inquiry.subject);
	const message = escapeHtml(inquiry.message);
	return send({
		from,
		to: inquiry.email,
		subject: "We received your Hands Free Soccer inquiry",
		html: layout(
			"We received your inquiry",
			`<p>Hi ${fullName},</p><p>Thank you for reaching out. Our team has received your inquiry and will reply as soon as possible.</p><div style="background:#a81414;color:#fff;padding:16px;margin:24px 0"><p style="color:#fff"><strong>Subject:</strong> ${subject}</p><p style="white-space:pre-wrap;color:#fff"><strong>Your message:</strong><br>${message}</p></div><p>If you need immediate assistance, call <a href="tel:+14692882265" style="color:#a81414">(469) 288-2265</a>.</p>`,
		),
	});
}
