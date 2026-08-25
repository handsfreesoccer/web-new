import { z } from "zod";

export const contactSchema = z.object({
	fullName: z.string().trim().min(2, "Your name is required"),
	email: z.string().trim().email("Enter a valid email address"),
	subject: z.enum(["classes", "schedules", "enrollment", "private", "other"]),
	message: z
		.string()
		.trim()
		.min(10, "Please tell us a little more about your inquiry"),
});

export type ContactInput = z.infer<typeof contactSchema>;
