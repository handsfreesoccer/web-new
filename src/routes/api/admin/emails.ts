import { createFileRoute } from "@tanstack/react-router";
import { StatusCodes } from "http-status-codes";
import "@tanstack/react-start";
import "@tanstack/react-start/server";
import { getPrisma } from "#/db";
import { requireAdmin } from "#/server/admin-request";
import { sendPaymentEmail, sendReminderEmail } from "#/server/email";
import { createAppointmentPaymentLink } from "#/server/stripe";
import { failure, jsonBody, success } from "#/server/response";
import { z } from "zod";

export const Route = createFileRoute("/api/admin/emails")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				const auth = await requireAdmin(request);
				if (auth.error) return auth.error;
				const body = await jsonBody<{ bookingId?: number; type?: string }>(
					request,
				);
				if (body.error) return body.error;
				const parsed = z
					.object({
						bookingId: z.coerce.number().int(),
						type: z.enum(["reminder", "payment"]),
					})
					.safeParse(body.value);
				if (!parsed.success)
					return failure(
						"Choose a booking and email type.",
						StatusCodes.UNPROCESSABLE_ENTITY,
					);
				const prisma = await getPrisma();
				const booking = await prisma.booking.findUnique({
					where: { id: parsed.data.bookingId },
				});
				if (!booking)
					return failure("Student was not found.", StatusCodes.NOT_FOUND);
				try {
					if (parsed.data.type === "reminder") await sendReminderEmail(booking);
					else {
						const url = await createAppointmentPaymentLink(booking);
						if (!url)
							return failure(
								"Configure Stripe before sending a payment email.",
								StatusCodes.SERVICE_UNAVAILABLE,
							);
						await sendPaymentEmail(booking, url);
					}
					return success({}, "Email sent.");
				} catch {
					return failure(
						"Email could not be sent.",
						StatusCodes.BAD_GATEWAY,
						["Email provider unavailable."],
						true,
					);
				}
			},
		},
	},
});
