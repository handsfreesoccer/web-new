import { Resend } from "resend";
import type { ContactInput } from "#/lib/contact-schema";
import { createCalendarInvite } from "#/server/calendar";

const resend = process.env.RESEND_API_KEY
	? new Resend(process.env.RESEND_API_KEY)
	: null;
const from =
	process.env.EMAIL_FROM ?? "Hands Free Soccer <handsfreesoccer@gmail.com>";
const appUrl = (process.env.APP_URL ?? "http://localhost:5173").replace(
	/\/$/,
	"",
);
const logoUrl = `${appUrl}/brand/logo.png`;

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

const fontSans =
	"Open Sans, BlinkMacSystemFont, Segoe UI, Helvetica Neue, Arial, sans-serif";
const fontDisplay =
	"Montserrat, BlinkMacSystemFont, Segoe UI, Helvetica Neue, Arial, sans-serif";
const fontCta =
	"Sofia Sans, BlinkMacSystemFont, Segoe UI, Helvetica Neue, Arial, sans-serif";

const spacer = (px: number) =>
	`<tr><td><div style="mso-line-height-rule: exactly; mso-line-height-alt: ${px}px; line-height: ${px}px; font-size: 1px; display: block;">&nbsp;</div></td></tr>`;

const paragraph = (html: string, opts?: { muted?: boolean; size?: number }) =>
	`<tr><td align="center"><table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width: 100%"><tr><td><p style="margin: 0; font-family: ${fontSans}; line-height: 25px; font-weight: 400; font-size: ${opts?.size ?? 15}px; letter-spacing: -0.1px; color: ${opts?.muted ? "#64748b" : "#141414"}; text-align: left; mso-line-height-rule: exactly; mso-text-raise: 3px;">${html}</p></td></tr></table></td></tr>`;

const callout = (html: string) =>
	`<tr><td align="left"><table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width: 100%;"><tr><td style="background-color: #fdf2f2; border: 1px solid #f0c4c4; border-radius: 8px; padding: 16px 20px;"><p style="margin: 0; font-family: ${fontSans}; line-height: 24px; font-weight: 400; font-size: 14px; color: #141414; text-align: left; mso-line-height-rule: exactly;">${html}</p></td></tr></table></td></tr>`;

const ctaButton = (href: string, label: string) =>
	`<tr><td align="left"><table class="t-cta-wrap" role="presentation" cellpadding="0" cellspacing="0" style="margin-right: auto; max-width: 514px;"><tr><td style="width: auto"><table class="t-cta" role="presentation" cellpadding="0" cellspacing="0" style="width: auto; max-width: 514px;"><tr><td style="overflow: hidden; background-color: #a81414; text-align: center; line-height: 34px; mso-line-height-rule: exactly; mso-text-raise: 5px; padding: 0 23px; border-radius: 40px;"><a href="${href}" style="display: block; margin: 0; font-family: ${fontCta}; line-height: 34px; font-weight: 700; font-size: 16px; letter-spacing: -0.2px; color: #ffffff; text-align: center; text-decoration: none; mso-line-height-rule: exactly; mso-text-raise: 5px;">${label}</a></td></tr></table></td></tr></table></td></tr>`;

const layout = (title: string, bodyRows: string) => `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
	<title>${title}</title>
	<meta charset="UTF-8" />
	<meta name="viewport" content="width=device-width" />
	<meta name="format-detection" content="telephone=no, date=no, address=no, email=no, url=no" />
	<style type="text/css">
		table { border-collapse: separate; table-layout: fixed; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
		table td { border-collapse: collapse; }
		body { min-width: 100%; margin: 0; padding: 0; }
		img { margin: 0; padding: 0; -ms-interpolation-mode: bicubic; }
		a { text-decoration: none; }
		@media (max-width: 480px) {
			.t-spacer-top, .t-spacer-bottom { mso-line-height-alt: 0px !important; line-height: 0 !important; display: none !important; }
			.t-card { padding: 40px !important; border-radius: 0 !important; }
			.t-footer-gap { display: revert !important; }
		}
	</style>
	<!--[if !mso]><!-->
	<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@700&amp;family=Sofia+Sans:wght@700&amp;family=Open+Sans:wght@400;500;600&amp;display=swap" rel="stylesheet" type="text/css" />
	<!--<![endif]-->
</head>
<body id="body" style="min-width: 100%; margin: 0; padding: 0; background-color: #ffffff;">
	<div style="background-color: #ffffff">
		<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" align="center">
			<tr>
				<td style="font-size: 0; line-height: 0; mso-line-height-rule: exactly; background-color: #ffffff;" valign="top" align="center">
					<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" align="center" id="innerTable">
						<tr>
							<td>
								<div class="t-spacer-top" style="mso-line-height-rule: exactly; mso-line-height-alt: 50px; line-height: 50px; font-size: 1px; display: block;">&nbsp;</div>
							</td>
						</tr>
						<tr>
							<td align="center">
								<table role="presentation" cellpadding="0" cellspacing="0" style="margin-left: auto; margin-right: auto">
									<tr>
										<td width="600" style="width: 600px">
											<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width: 100%">
												<tr>
													<td class="t-card" style="border: 1px solid #ebebeb; overflow: hidden; background-color: #ffffff; padding: 44px 42px 32px 42px; border-radius: 3px;">
														<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width: 100% !important">
															<tr>
																<td align="left">
																	<table role="presentation" cellpadding="0" cellspacing="0" style="margin-right: auto">
																		<tr>
																			<td width="72" style="width: 72px">
																				<div style="font-size: 0px">
																					<img style="display: block; border: 0; height: auto; width: 100%; margin: 0; max-width: 100%;" width="72" height="72" alt="HandsFree Soccer Academy" src="${logoUrl}" />
																				</div>
																			</td>
																		</tr>
																	</table>
																</td>
															</tr>
															${spacer(42)}
															<tr>
																<td align="center">
																	<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width: 100%">
																		<tr>
																			<td style="border-bottom: 1px solid #eff1f4; padding: 0 0 18px 0;">
																				<h1 style="margin: 0; font-family: ${fontDisplay}; line-height: 28px; font-weight: 700; font-size: 24px; letter-spacing: -1px; color: #141414; text-align: left; mso-line-height-rule: exactly; mso-text-raise: 1px;">${title}</h1>
																			</td>
																		</tr>
																	</table>
																</td>
															</tr>
															${spacer(18)}
															${bodyRows}
															${spacer(40)}
															<tr>
																<td align="center">
																	<table role="presentation" cellpadding="0" cellspacing="0" style="margin-left: auto; margin-right: auto" width="100%">
																		<tr>
																			<td style="border-top: 1px solid #dfe1e4; padding: 24px 0 0 0;">
																				<table role="presentation" cellpadding="0" cellspacing="0" align="left" valign="top">
																					<tr class="t-footer-row">
																						<td class="t-footer-brand" valign="top">
																							<span style="display: block; margin: 0; font-family: ${fontSans}; line-height: 20px; font-weight: 600; font-size: 14px; color: #222222; text-align: left; mso-line-height-rule: exactly; mso-text-raise: 2px;">HandsFree Soccer Academy</span>
																							<span style="display: block; margin: 4px 0 0 0; font-family: ${fontSans}; line-height: 20px; font-weight: 400; font-size: 13px; color: #64748b; text-align: left; mso-line-height-rule: exactly;">Serving Allen, McKinney, Melissa &amp; Princeton, TX</span>
																						</td>
																						<td class="t-footer-gap" style="width: 20px;" width="20"></td>
																						<td class="t-footer-meta" valign="top">
																							<span style="display: block; margin: 0; font-family: ${fontSans}; line-height: 20px; font-weight: 500; font-size: 14px; color: #b4becc; text-align: left; mso-line-height-rule: exactly; mso-text-raise: 2px;">&copy; ${new Date().getFullYear()} HandsFree Soccer Academy</span>
																						</td>
																					</tr>
																				</table>
																			</td>
																		</tr>
																	</table>
																</td>
															</tr>
														</table>
													</td>
												</tr>
											</table>
										</td>
									</tr>
								</table>
							</td>
						</tr>
						<tr>
							<td>
								<div class="t-spacer-bottom" style="mso-line-height-rule: exactly; mso-line-height-alt: 50px; line-height: 50px; font-size: 1px; display: block;">&nbsp;</div>
							</td>
						</tr>
					</table>
				</td>
			</tr>
		</table>
	</div>
</body>
</html>`;

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
			[
				paragraph(`Hi ${escapeHtml(booking.firstName)} ${escapeHtml(booking.lastName)},`),
				spacer(12),
				paragraph(
					"We have received your booking information and look forward to seeing you. Your calendar invite is attached to this email.",
				),
				spacer(24),
				callout("Please keep this email for your appointment details."),
			].join(""),
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
	const safeUrl = escapeHtml(paymentUrl);
	return send({
		from,
		to: booking.email,
		subject: "Your Hands Free Soccer appointment payment link",
		html: layout(
			"We were glad to have you",
			[
				paragraph(`Hi ${escapeHtml(booking.firstName)},`),
				spacer(12),
				paragraph(
					"Thank you for training with us. Use the link below to pay for your appointment.",
				),
				spacer(24),
				ctaButton(safeUrl, "Pay for appointment"),
				spacer(20),
				paragraph(
					"If the button does not work, copy and paste this link into your browser:",
					{ muted: true, size: 14 },
				),
				spacer(8),
				paragraph(
					`<a href="${safeUrl}" style="color: #a81414; word-break: break-all;">${safeUrl}</a>`,
					{ size: 13 },
				),
			].join(""),
		),
	});
}

export async function sendReminderEmail(booking: BookingEmail) {
	const maps =
		process.env.GOOGLE_MAPS_URL ?? "https://maps.google.com/?q=Allen,Texas";
	const safeMaps = escapeHtml(maps);
	return send({
		from,
		to: booking.email,
		subject: "Your Hands Free Soccer appointment is tomorrow",
		html: layout(
			"Your appointment is tomorrow",
			[
				paragraph(`Hi ${escapeHtml(booking.firstName)},`),
				spacer(12),
				paragraph("We cannot wait to see you tomorrow."),
				spacer(24),
				callout(
					`<strong>Location:</strong> <a href="${safeMaps}" style="color: #a81414; text-decoration: underline; font-weight: 600;">Hands Free Soccer courts</a><br /><strong>Phone:</strong> <a href="tel:+14692882265" style="color: #a81414; text-decoration: underline; font-weight: 600;">(469) 288-2265</a>`,
				),
			].join(""),
		),
	});
}

export async function sendAdminMagicLink(email: string, link: string) {
	const safeLink = escapeHtml(link);
	return send({
		from,
		to: email,
		subject: "Your Hands Free Soccer admin sign-in link",
		html: layout(
			"Sign in to the dashboard",
			[
				paragraph("This link expires in 15 minutes."),
				spacer(24),
				ctaButton(safeLink, "Open dashboard"),
				spacer(20),
				paragraph(
					"If the button does not work, copy and paste this link into your browser:",
					{ muted: true, size: 14 },
				),
				spacer(8),
				paragraph(
					`<a href="${safeLink}" style="color: #a81414; word-break: break-all;">${safeLink}</a>`,
					{ size: 13 },
				),
			].join(""),
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
			[
				paragraph(`Hi ${fullName},`),
				spacer(12),
				paragraph(
					"Thank you for reaching out. Our team has received your inquiry and will reply as soon as possible.",
				),
				spacer(24),
				callout(
					`<strong>Subject:</strong> ${subject}<br /><br /><strong>Your message:</strong><br /><span style="white-space: pre-wrap;">${message}</span>`,
				),
				spacer(16),
				paragraph(
					`If you need immediate assistance, call <a href="tel:+14692882265" style="color: #a81414; text-decoration: underline; font-weight: 600;">(469) 288-2265</a> or email <a href="mailto:handsfreesoccer@gmail.com" style="color: #a81414; text-decoration: underline; font-weight: 600;">handsfreesoccer@gmail.com</a>.`,
					{ muted: true, size: 14 },
				),
			].join(""),
		),
	});
}
