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
	`<!doctype html><html><body style="margin:0;background:#eef2f3;font-family:Arial,Helvetica,sans-serif;color:#12212b"><main style="max-width:600px;margin:32px auto;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 12px 30px rgba(18,33,43,.12)"><div style="height:8px;background:#b23a2f"></div><div style="padding:28px 32px 16px;text-align:center"><div style="width:170px;height:58px;margin:auto;border:1px dashed #b23a2f;border-radius:10px;line-height:58px;color:#b23a2f;font-size:11px;font-weight:bold;letter-spacing:1.5px">LOGO PLACEHOLDER</div></div><div style="padding:12px 40px 40px"><div style="color:#b23a2f;font-weight:800;letter-spacing:.12em;font-size:12px">HANDS FREE SOCCER</div><h1 style="color:#12212b">${title}</h1>${body}</div><div style="padding:20px 40px;background:#12212b;color:#fff;font-size:12px;line-height:1.5">Hands Free Soccer<br><span style="color:#b8c5ca">Serving Allen, McKinney, Melissa &amp; Princeton, TX</span></div></main></body></html>`;

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
			`<p>Hi ${booking.firstName},</p><p>Thank you for training with us. Use the link below to pay for your appointment.</p><p><a href="${paymentUrl}" style="display:inline-block;background:#2f6a4a;color:white;padding:14px 22px;border-radius:999px">Pay for appointment</a></p>`,
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
			`<p>This link expires in 15 minutes.</p><p><a href="${link}" style="display:inline-block;background:#2f6a4a;color:white;padding:14px 22px;border-radius:999px">Open dashboard</a></p>`,
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
			`<p>Hi ${fullName},</p><p>Thank you for reaching out. Our team has received your inquiry and will reply as soon as possible.</p><div style="background:#f3faf5;border-left:4px solid #2f6a4a;padding:16px;margin:24px 0"><p><strong>Subject:</strong> ${subject}</p><p style="white-space:pre-wrap"><strong>Your message:</strong><br>${message}</p></div><p>If you need immediate assistance, call <a href="tel:+14692882265">(469) 288-2265</a>.</p>`,
		),
	});
}
