import { z } from "zod";

export const bookingSchema = z
	.object({
		firstName: z.string().trim().min(2, "First name is required"),
		lastName: z.string().trim().min(2, "Last name is required"),
		email: z.string().trim().email("Enter a valid email address"),
		phone: z.string().trim().min(7, "Enter a valid phone number"),
		classType: z.enum([
			"beginner",
			"intermediate",
			"one-on-one",
			"biweekly-saturday",
		]),
		appointmentStart: z.coerce.date(),
		appointmentEnd: z.coerce.date(),
	})
	.refine((value) => value.appointmentStart.getTime() > Date.now(), {
		message: "Choose a future appointment time",
		path: ["appointmentStart"],
	})
	.refine(
		(value) => value.appointmentEnd.getTime() > value.appointmentStart.getTime(),
		{
			message: "End time must be after start time",
			path: ["appointmentEnd"],
		},
	);

export type BookingInput = z.infer<typeof bookingSchema>;
