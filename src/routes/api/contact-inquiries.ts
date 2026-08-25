import { createFileRoute } from "@tanstack/react-router";
import { StatusCodes } from "http-status-codes";
import { ZodError } from "zod";
import "@tanstack/react-start";
import "@tanstack/react-start/server";
import { contactSchema } from "#/lib/contact-schema";
import { sendContactConfirmation } from "#/server/email";
import { failure, jsonBody, success } from "#/server/response";

export const Route = createFileRoute("/api/contact-inquiries")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				const body = await jsonBody<unknown>(request);
				if (body.error) return body.error;
				try {
					const inquiry = contactSchema.parse(body.value);
					await sendContactConfirmation(inquiry);
					return success(
						{},
						"Your inquiry has been received.",
						StatusCodes.CREATED,
					);
				} catch (error) {
					if (error instanceof ZodError)
						return failure(
							"Please correct the highlighted fields.",
							StatusCodes.UNPROCESSABLE_ENTITY,
							error.issues.map((issue) => issue.message),
						);
					return failure(
						"We could not send your inquiry right now.",
						StatusCodes.INTERNAL_SERVER_ERROR,
					);
				}
			},
		},
	},
});
